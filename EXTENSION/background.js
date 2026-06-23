const API_BASE = 'http://127.0.0.1:8000';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

const SAFE_DOMAINS = new Set([
  'google.com', 'youtube.com', 'facebook.com', 'amazon.com', 'twitter.com',
  'instagram.com', 'linkedin.com', 'github.com', 'stackoverflow.com',
  'microsoft.com', 'apple.com', 'reddit.com', 'wikipedia.org', 'netflix.com',
  'localhost', '127.0.0.1'
]);

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['autoProtectEnabled'], (result) => {
    if (result.autoProtectEnabled === undefined) {
      chrome.storage.local.set({ autoProtectEnabled: false });
    }
  });
  updateBadge(0);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.remove(`threats_${tabId}`);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    chrome.storage.local.remove(`threats_${tabId}`);
    updateBadge(0, tabId);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'scanUrls') {
    const tabId = sender.tab?.id;
    handleScanUrls(message.urls, tabId).then(sendResponse);
    return true;
  }
  if (message.action === 'getAutoProtectStatus') {
    chrome.storage.local.get(['autoProtectEnabled'], (result) => {
      sendResponse({ enabled: result.autoProtectEnabled || false });
    });
    return true;
  }
  if (message.action === 'toggleAutoProtect') {
    toggleAutoProtect(message.enabled).then(sendResponse);
    return true;
  }
  if (message.action === 'updateBadge') {
    updateBadge(message.count, sender.tab?.id);
    sendResponse({ success: true });
    return true;
  }
  if (message.action === 'getTabThreats') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.storage.local.get(`threats_${tabs[0].id}`, (result) => {
          sendResponse({ threats: result[`threats_${tabs[0].id}`] || [] });
        });
      } else {
        sendResponse({ threats: [] });
      }
    });
    return true;
  }
  if (message.action === 'reportThreats') {
    const tabId = sender.tab?.id;
    if (tabId && message.threats) {
      chrome.storage.local.set({ [`threats_${tabId}`]: message.threats });
      updateBadge(message.threats.length, tabId);
    }
    sendResponse({ success: true });
    return true;
  }
});

async function toggleAutoProtect(enabled) {
  await chrome.storage.local.set({ autoProtectEnabled: enabled });
  if (!enabled) { updateBadge(0); }
  return { success: true, enabled };
}

async function handleScanUrls(urls, tabId) {
  const autoProtect = await getAutoProtectStatus();
  if (!autoProtect) return { results: {}, cached: true };

  const filteredUrls = filterUrls(urls);
  if (filteredUrls.length === 0) return { results: {}, cached: true };

  const { cachedResults, urlsToScan } = await checkCache(filteredUrls);
  let allResults = cachedResults;

  if (urlsToScan.length > 0) {
    const newResults = await batchScanUrls(urlsToScan);
    allResults = { ...cachedResults, ...newResults };
    await updateCache(newResults);
  }

  const threats = Object.entries(allResults).filter(([, r]) => r.phishing).map(([url]) => url);

  if (tabId) {
    chrome.storage.local.set({ [`threats_${tabId}`]: threats });
    updateBadge(threats.length, tabId);
  }

  if (threats.length > 0) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: `⚠️ ${threats.length} Phishing Link${threats.length > 1 ? 's' : ''} Found`,
      message: 'Zentrya detected dangerous links on this page.',
      priority: 2
    });
  }

  return { results: allResults, cached: urlsToScan.length === 0 };
}

function filterUrls(urls) {
  const filtered = [];
  const seen = new Set();
  for (const url of urls) {
    try {
      const u = new URL(url);
      if (!u.protocol.startsWith('http')) continue;
      const domain = u.hostname.replace('www.', '');
      if (SAFE_DOMAINS.has(domain)) continue;
      if (seen.has(url)) continue;
      seen.add(url);
      filtered.push(url);
    } catch { continue; }
  }
  return filtered;
}

async function checkCache(urls) {
  const cache = await chrome.storage.local.get(['urlCache']);
  const urlCache = cache.urlCache || {};
  const cachedResults = {};
  const urlsToScan = [];
  const now = Date.now();
  for (const url of urls) {
    const cached = urlCache[url];
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      cachedResults[url] = { phishing: cached.phishing };
    } else {
      urlsToScan.push(url);
    }
  }
  return { cachedResults, urlsToScan };
}

async function updateCache(results) {
  const cache = await chrome.storage.local.get(['urlCache']);
  const urlCache = cache.urlCache || {};
  const now = Date.now();
  for (const [url, result] of Object.entries(results)) {
    urlCache[url] = { phishing: result.phishing, timestamp: now };
  }
  const entries = Object.entries(urlCache);
  if (entries.length > 1000) {
    entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
    await chrome.storage.local.set({ urlCache: Object.fromEntries(entries.slice(0, 1000)) });
  } else {
    await chrome.storage.local.set({ urlCache });
  }
}

async function batchScanUrls(urls) {
  const BATCH_SIZE = 10;
  const results = {};
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(scanSingleUrl));
    batch.forEach((url, idx) => { results[url] = batchResults[idx]; });
    if (i + BATCH_SIZE < urls.length) await new Promise(r => setTimeout(r, 300));
  }
  return results;
}

async function scanSingleUrl(url) {
  try {
    const res = await fetch(`${API_BASE}/api/phishing/predict/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    if (!res.ok) return { phishing: false, error: true };
    const data = await res.json();
    return { phishing: data.phishing || false };
  } catch {
    return { phishing: false, error: true };
  }
}

async function getAutoProtectStatus() {
  const result = await chrome.storage.local.get(['autoProtectEnabled']);
  return result.autoProtectEnabled || false;
}

function updateBadge(count, tabId) {
  const text = count > 0 ? String(count) : '';
  const color = count > 0 ? '#ef4444' : '#22c55e';
  if (tabId) {
    chrome.action.setBadgeText({ text, tabId });
    chrome.action.setBadgeBackgroundColor({ color, tabId });
  } else {
    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color });
  }
}
