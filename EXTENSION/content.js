// Zentrya Content Script - scans all links on pages when Auto-Protect is enabled

let isScanning = false;
let autoProtectEnabled = false;

chrome.runtime.sendMessage({ action: 'getAutoProtectStatus' }, (response) => {
  autoProtectEnabled = response?.enabled || false;
  if (autoProtectEnabled) initializeScanner();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'autoProtectToggled') {
    autoProtectEnabled = message.enabled;
    if (autoProtectEnabled) initializeScanner();
    else clearAllWarnings();
    sendResponse({ success: true });
  }
});

function initializeScanner() {
  if (!autoProtectEnabled) return;
  scanPageLinks();

  const observer = new MutationObserver(() => {
    clearTimeout(observer._timeout);
    observer._timeout = setTimeout(scanPageLinks, 1000);
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

async function scanPageLinks() {
  if (!autoProtectEnabled || isScanning) return;
  isScanning = true;

  const links = document.querySelectorAll('a[href]');
  const urls = [];
  const linkElements = new Map();

  links.forEach(link => {
    const href = link.href;
    if (!href || !href.startsWith('http')) return;
    if (isSameDomain(href)) return;

    urls.push(href);
    if (!linkElements.has(href)) linkElements.set(href, []);
    linkElements.get(href).push(link);
  });

  if (urls.length === 0) {
    chrome.runtime.sendMessage({ action: 'updateBadge', count: 0 });
    isScanning = false;
    return;
  }

  chrome.runtime.sendMessage({ action: 'scanUrls', urls }, (response) => {
    if (response?.results) {
      highlightDangerousLinks(response.results, linkElements);
      const threats = Object.entries(response.results).filter(([, r]) => r.phishing).map(([url]) => url);
      chrome.runtime.sendMessage({ action: 'reportThreats', threats });
    }
    isScanning = false;
  });
}

function isSameDomain(href) {
  try { return new URL(href).hostname === window.location.hostname; }
  catch { return false; }
}

function highlightDangerousLinks(results, linkElements) {
  let threatCount = 0;
  for (const [url, result] of Object.entries(results)) {
    const elements = linkElements.get(url);
    if (!elements) continue;
    if (result.phishing) {
      threatCount++;
      elements.forEach(markAsDangerous);
    } else {
      elements.forEach(removeWarning);
    }
  }
  chrome.runtime.sendMessage({ action: 'updateBadge', count: threatCount });
}

function markAsDangerous(element) {
  element.classList.add('zentrya-phishing-warning');
  element.style.cssText = `
    border: 2px solid #ef4444 !important;
    background-color: rgba(239,68,68,0.1) !important;
    border-radius: 4px !important;
    padding: 1px 3px !important;
    position: relative !important;
  `;

  if (!element.dataset.zentryaWarning) {
    element.dataset.zentryaWarning = 'true';
    element.addEventListener('click', handlePhishingClick, { capture: true });

    const tooltip = document.createElement('span');
    tooltip.className = 'zentrya-tooltip';
    tooltip.textContent = '⚠️ Zentrya: Potential phishing link';
    tooltip.style.cssText = `
      position: fixed !important; background: #dc2626 !important; color: white !important;
      padding: 6px 12px !important; border-radius: 6px !important; font-size: 12px !important;
      font-weight: 600 !important; white-space: nowrap !important; z-index: 2147483647 !important;
      display: none !important; pointer-events: none !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important; font-family: -apple-system, sans-serif !important;
    `;
    document.body.appendChild(tooltip);

    element.addEventListener('mouseenter', () => {
      const rect = element.getBoundingClientRect();
      tooltip.style.left = `${rect.left}px`;
      tooltip.style.top = `${rect.top - 32}px`;
      tooltip.style.display = 'block';
    });
    element.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
    element._zentryaTooltip = tooltip;
  }
}

function handlePhishingClick(e) {
  if (!confirm('⚠️ WARNING: Zentrya detected this link as potentially dangerous.\n\nAre you sure you want to proceed?')) {
    e.preventDefault();
    e.stopPropagation();
  }
}

function removeWarning(element) {
  element.classList.remove('zentrya-phishing-warning');
  element.style.cssText = '';
  if (element.dataset.zentryaWarning) {
    delete element.dataset.zentryaWarning;
    if (element._zentryaTooltip) { element._zentryaTooltip.remove(); delete element._zentryaTooltip; }
    element.removeEventListener('click', handlePhishingClick, { capture: true });
  }
}

function clearAllWarnings() {
  document.querySelectorAll('[data-zentrya-warning="true"]').forEach(removeWarning);
  document.querySelectorAll('.zentrya-tooltip').forEach(t => t.remove());
  chrome.runtime.sendMessage({ action: 'updateBadge', count: 0 });
}
