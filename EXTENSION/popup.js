const API_URL = 'http://127.0.0.1:8000';
const DASHBOARD_URL = 'http://localhost:5173/dashboard';

document.addEventListener('DOMContentLoaded', () => {
  const selectionScreen = document.getElementById('selectionScreen');
  const urlScreen = document.getElementById('urlScreen');
  const emailScreen = document.getElementById('emailScreen');
  const metadataScreen = document.getElementById('metadataScreen');

  const autoProtectToggle = document.getElementById('autoProtectToggle');
  const autoProtectStatus = document.getElementById('autoProtectStatus');
  const statusText = document.getElementById('statusText');

  // Dashboard link
  document.getElementById('openDashboard').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: DASHBOARD_URL });
  });

  // Navigation
  document.getElementById('selectUrlBtn').addEventListener('click', () => {
    selectionScreen.classList.add('hidden');
    urlScreen.classList.remove('hidden');
    document.getElementById('urlInput').focus();
  });
  document.getElementById('selectEmailBtn').addEventListener('click', () => {
    selectionScreen.classList.add('hidden');
    emailScreen.classList.remove('hidden');
    document.getElementById('emailInput').focus();
  });
  document.getElementById('selectMetadataBtn').addEventListener('click', () => {
    selectionScreen.classList.add('hidden');
    metadataScreen.classList.remove('hidden');
    document.getElementById('metadataInput').focus();
  });
  document.getElementById('backFromUrl').addEventListener('click', () => {
    urlScreen.classList.add('hidden');
    selectionScreen.classList.remove('hidden');
    document.getElementById('urlInput').value = '';
    document.getElementById('urlResult').classList.add('hidden');
  });
  document.getElementById('backFromEmail').addEventListener('click', () => {
    emailScreen.classList.add('hidden');
    selectionScreen.classList.remove('hidden');
    document.getElementById('emailInput').value = '';
    document.getElementById('emailResult').classList.add('hidden');
  });
  document.getElementById('backFromMetadata').addEventListener('click', () => {
    metadataScreen.classList.add('hidden');
    selectionScreen.classList.remove('hidden');
    document.getElementById('metadataInput').value = '';
    document.getElementById('metadataResult').classList.add('hidden');
  });

  // Scan current page buttons
  document.getElementById('scanCurrentPage').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) document.getElementById('urlInput').value = tab.url;
  });
  document.getElementById('metaCurrentPage').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      try { document.getElementById('metadataInput').value = new URL(tab.url).hostname; }
      catch { document.getElementById('metadataInput').value = tab.url; }
    }
  });

  // Auto-Protect
  chrome.runtime.sendMessage({ action: 'getAutoProtectStatus' }, (response) => {
    if (response) {
      autoProtectToggle.checked = response.enabled;
      updateStatusMessage(response.enabled);
      if (response.enabled) loadDetectedThreats();
    }
  });

  autoProtectToggle.addEventListener('change', () => {
    const enabled = autoProtectToggle.checked;
    chrome.runtime.sendMessage({ action: 'toggleAutoProtect', enabled }, (response) => {
      if (response?.success) {
        updateStatusMessage(enabled);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'autoProtectToggled', enabled }).catch(() => {});
          }
        });
      }
    });
  });

  const refreshInterval = setInterval(() => {
    if (autoProtectToggle.checked) loadDetectedThreats();
  }, 3000);
  window.addEventListener('unload', () => clearInterval(refreshInterval));

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'threatsUpdated') loadDetectedThreats();
  });

  function updateStatusMessage(enabled) {
    statusText.textContent = enabled
      ? '✅ Auto-Protect active — browsing safely'
      : '⚠️ Auto-Protect off — enable for real-time scanning';
    autoProtectStatus.className = `status-message ${enabled ? 'active' : 'inactive'}`;
    autoProtectStatus.classList.remove('hidden');

    const threatsSection = document.getElementById('threatsSection');
    if (enabled) { threatsSection.classList.remove('hidden'); loadDetectedThreats(); }
    else { threatsSection.classList.add('hidden'); }
  }

  function loadDetectedThreats() {
    chrome.runtime.sendMessage({ action: 'getTabThreats' }, (response) => {
      if (response?.threats) displayThreats(response.threats);
    });
  }

  function displayThreats(threats) {
    const list = document.getElementById('threatsList');
    document.getElementById('threatCount').textContent = threats.length;
    if (threats.length === 0) {
      list.innerHTML = '<p class="no-threats">✅ No threats detected on this page</p>';
      return;
    }
    list.innerHTML = threats.map(url => {
      const display = url.length > 55 ? url.substring(0, 55) + '...' : url;
      return `<div class="threat-item"><div class="threat-icon">⚠️</div><div class="threat-url" title="${url}">${display}</div></div>`;
    }).join('');
  }

  // URL Scanner
  const urlInput = document.getElementById('urlInput');
  const scanUrlBtn = document.getElementById('scanUrlBtn');
  const urlResult = document.getElementById('urlResult');
  const urlLoader = document.getElementById('urlLoader');

  scanUrlBtn.addEventListener('click', handleUrlScan);
  urlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleUrlScan(); });

  async function handleUrlScan() {
    let url = urlInput.value.trim();
    if (!url) { showResult(urlResult, 'Please enter a URL', 'error'); return; }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
      urlInput.value = url;
    }

    urlLoader.classList.remove('hidden');
    urlResult.classList.add('hidden');
    scanUrlBtn.disabled = true;

    try {
      const res = await fetch(`${API_URL}/api/phishing/predict/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.url_exists === false) {
          showResult(urlResult, '❌ ' + (data.warning || 'This website does not exist or is unreachable.'), 'error');
        } else {
          showResult(urlResult, data.phishing
            ? '⚠️ Phishing detected! This URL is dangerous.'
            : '✅ URL is safe. No phishing detected.',
            data.phishing ? 'danger' : 'safe');
        }
      } else {
        showResult(urlResult, data.error || 'Scan failed', 'error');
      }
    } catch {
      showResult(urlResult, 'Cannot reach server. Is the backend running?', 'error');
    }
    urlLoader.classList.add('hidden');
    scanUrlBtn.disabled = false;
  }

  // Email Scanner
  const emailInput = document.getElementById('emailInput');
  const scanEmailBtn = document.getElementById('scanEmailBtn');
  const emailResult = document.getElementById('emailResult');
  const emailLoader = document.getElementById('emailLoader');

  scanEmailBtn.addEventListener('click', handleEmailScan);

  async function handleEmailScan() {
    const message = emailInput.value.trim();
    if (!message) { showResult(emailResult, 'Please enter email content', 'error'); return; }

    emailLoader.classList.remove('hidden');
    emailResult.classList.add('hidden');
    scanEmailBtn.disabled = true;

    try {
      const res = await fetch(`${API_URL}/api/spam/predict/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      if (res.ok) {
        showResult(emailResult, data.prediction === 'spam'
          ? '🚨 Spam detected! This email is suspicious.'
          : '✅ Email is safe. No spam detected.',
          data.prediction === 'spam' ? 'danger' : 'safe');
      } else {
        showResult(emailResult, data.error || 'Scan failed', 'error');
      }
    } catch {
      showResult(emailResult, 'Cannot reach server. Is the backend running?', 'error');
    }
    emailLoader.classList.add('hidden');
    scanEmailBtn.disabled = false;
  }

  // Metadata Fetcher
  const metadataInput = document.getElementById('metadataInput');
  const fetchMetadataBtn = document.getElementById('fetchMetadataBtn');
  const metadataResult = document.getElementById('metadataResult');
  const metadataLoader = document.getElementById('metadataLoader');

  fetchMetadataBtn.addEventListener('click', handleMetadataFetch);
  metadataInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleMetadataFetch(); });

  async function handleMetadataFetch() {
    let domain = metadataInput.value.trim();
    if (!domain) { showMetadataError('Please enter a domain'); return; }
    if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
      domain = 'https://' + domain;
      metadataInput.value = domain;
    }

    metadataLoader.classList.remove('hidden');
    metadataResult.classList.add('hidden');
    fetchMetadataBtn.disabled = true;

    try {
      const res = await fetch(`${API_URL}/api/metadata/metadata/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: domain })
      });
      const data = await res.json();
      if (res.ok) displayMetadata(data);
      else showMetadataError(data.error || 'Fetch failed');
    } catch {
      showMetadataError('Cannot reach server. Is the backend running?');
    }
    metadataLoader.classList.add('hidden');
    fetchMetadataBtn.disabled = false;
  }

  function displayMetadata(data) {
    const rc = data.risk_level?.includes('Safe') ? 'safe' : data.risk_level?.includes('⚠️') ? 'warning' : 'danger';
    let html = '<h3>Results</h3>';
    if (data.risk_level) html += `<div class="metadata-item"><strong>Risk</strong><span class="risk-badge ${rc}">${data.risk_level}</span></div>`;
    if (data.website_info?.title && data.website_info.title !== 'N/A') html += `<div class="metadata-item"><strong>Title</strong>${data.website_info.title}</div>`;
    if (data.ssl_info && !data.ssl_info.error) html += `<div class="metadata-item"><strong>SSL</strong>Issuer: ${data.ssl_info.issuer || 'N/A'} · Valid: ${data.ssl_info.ssl_valid ? '✅' : '❌'}</div>`;
    if (data.domain_info && !data.domain_info.error) html += `<div class="metadata-item"><strong>Domain</strong>Registrar: ${data.domain_info.registrar || 'N/A'}<br>Created: ${data.domain_info.creation_date || 'N/A'}</div>`;
    if (data.server_info) html += `<div class="metadata-item"><strong>Server</strong>${data.server_info.server || 'N/A'}</div>`;
    metadataResult.innerHTML = html;
    metadataResult.classList.remove('hidden');
  }

  function showMetadataError(msg) {
    metadataResult.innerHTML = `<div class="metadata-item" style="color:#f87171">${msg}</div>`;
    metadataResult.classList.remove('hidden');
  }

  function showResult(el, message, type) {
    el.textContent = message;
    el.className = `result ${type}`;
    el.classList.remove('hidden');
  }
});
