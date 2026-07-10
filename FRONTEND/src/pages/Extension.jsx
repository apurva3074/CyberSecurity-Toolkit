import { useState } from 'react';
import {
  HiOutlineDownload,
  HiOutlineLink,
  HiOutlineMail,
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiOutlineDesktopComputer,
  HiOutlineCheckCircle,
  HiOutlineDocumentDuplicate,
} from 'react-icons/hi';

const features = [
  {
    icon: HiOutlineLink,
    title: 'One-click URL scanning',
    description: 'Scan the page you\'re currently on for phishing signals without leaving your browser.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: HiOutlineMail,
    title: 'Email content checks',
    description: 'Paste suspicious email text into the popup for an instant spam and phishing analysis.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Metadata fetcher',
    description: 'Pull domain and typosquatting metadata for the active tab straight from the toolbar.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
  {
    icon: HiOutlineLightningBolt,
    title: 'Real-time auto-protect',
    description: 'Background monitoring flags risky pages as you browse, with instant notifications.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
];

const steps = [
  {
    title: 'Download the extension',
    description: 'Click the download button above to save zentrya-extension.zip to your computer.',
  },
  {
    title: 'Unzip the file',
    description: 'Extract the zip anywhere on your machine — you\'ll need the extracted folder in the next step.',
  },
  {
    title: 'Open your browser\'s extensions page',
    description: 'Go to chrome://extensions (or edge://extensions on Edge) and enable "Developer mode" using the toggle in the top-right corner.',
  },
  {
    title: 'Load the unpacked extension',
    description: 'Click "Load unpacked" and select the extracted zentrya-extension folder. Zentrya will appear in your toolbar.',
  },
];

export default function Extension() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('chrome://extensions');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable — ignore
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-10 lg:py-16 px-6 text-white">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
          <HiOutlineDesktopComputer className="w-4 h-4 text-purple-300" />
          <span className="text-sm text-purple-300 font-medium">Browser Extension</span>
        </div>

        <h1 className="font-extrabold mb-4 leading-tight text-[clamp(1.75rem,2.5vw,3rem)]">
          Take Zentrya{' '}
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            everywhere you browse
          </span>
        </h1>

        <p className="text-gray-400 leading-relaxed mb-8">
          Scan links, emails, and page metadata straight from your toolbar — no need to switch tabs to the dashboard.
        </p>

        <a
          href="/zentrya-extension.zip"
          download
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-100 hover:shadow-lg hover:shadow-white/10 transition-all duration-200"
        >
          <HiOutlineDownload className="w-5 h-5" />
          Download for Chrome / Edge
        </a>
        <p className="text-gray-600 text-xs mt-3">
          Works with any Chromium-based browser (Chrome, Edge, Brave). Manual install — not yet on the Chrome Web Store.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className={`flex items-start gap-4 p-5 rounded-xl ${f.bg} border ${f.border} transition hover:scale-[1.02]`}
            >
              <div className={`p-2.5 rounded-lg ${f.bg} border ${f.border} flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Install steps */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-purple-500/30 to-transparent" />
          <h2 className="text-xl font-semibold text-gray-300 whitespace-nowrap">Installation Guide</h2>
          <div className="h-px flex-1 bg-gradient-to-l from-purple-500/30 to-transparent" />
        </div>

        <div className="space-y-4">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 font-semibold flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {step.description}
                  {i === 2 && (
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-gray-300 text-xs hover:bg-white/20 transition align-middle"
                    >
                      {copied ? (
                        <>
                          <HiOutlineCheckCircle className="w-3.5 h-3.5 text-green-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <HiOutlineDocumentDuplicate className="w-3.5 h-3.5" />
                          Copy chrome://extensions
                        </>
                      )}
                    </button>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
