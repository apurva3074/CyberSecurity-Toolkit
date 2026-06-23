import { useState } from 'react';
import {
  HiOutlineLink,
  HiOutlineMail,
  HiOutlineShieldCheck,
  HiOutlineExclamationCircle,
  HiOutlinePlay,
  HiOutlinePhotograph,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
} from 'react-icons/hi';

import urlScanImage from '../assets/urlscanimage.svg';
import emailScanImage from '../assets/emailscanimage.svg';
import metadataImage from '../assets/metadataimage.svg';
import takedownImage from '../assets/takedownimage.svg';

const guides = [
  {
    id: 'url-scanner',
    title: 'URL Scanner',
    subtitle: 'Detect phishing and scam websites instantly',
    icon: HiOutlineLink,
    color: 'from-blue-600 to-cyan-500',
    accentBg: 'bg-blue-500/10',
    accentBorder: 'border-blue-500/20',
    accentText: 'text-blue-400',
    image: urlScanImage,
    steps: [
      {
        title: 'Navigate to URL Scanner',
        description: 'From the dashboard, scroll down to the URL Scanner section or click on it from the tools menu.',
        mediaType: 'screenshot',
        mediaPlaceholder: 'Screenshot: Dashboard with URL Scanner section highlighted',
      },
      {
        title: 'Enter the suspicious URL',
        description: 'Type or paste the full URL you want to check into the input field. Include https:// for best results.',
        mediaType: 'screenshot',
        mediaPlaceholder: 'Screenshot: URL input field with example URL entered',
      },
      {
        title: 'Click "Scan URL"',
        description: 'Hit the scan button to analyze the URL. Our AI model evaluates 11+ features including domain age, SSL status, and URL patterns.',
        mediaType: 'screenshot',
        mediaPlaceholder: 'Screenshot: Scan button being clicked',
      },
      {
        title: 'Review the results',
        description: 'The scanner will show whether the URL is safe or a phishing threat. If flagged as phishing, avoid visiting the site and consider submitting a takedown request.',
        mediaType: 'screenshot',
        mediaPlaceholder: 'Screenshot: Scan results showing safe/phishing verdict',
      },
    ],
  },
  {
    id: 'email-scanner',
    title: 'Email Scanner',
    subtitle: 'Analyze emails for phishing and spam indicators',
    icon: HiOutlineMail,
    color: 'from-purple-600 to-pink-500',
    accentBg: 'bg-purple-500/10',
    accentBorder: 'border-purple-500/20',
    accentText: 'text-purple-400',
    image: emailScanImage,
    steps: [
      {
        title: 'Go to Email Scanner',
        description: 'Navigate to the Email Scanner section from the dashboard.',
        mediaType: 'screenshot',
        mediaPlaceholder: 'Screenshot: Email Scanner section on dashboard',
      },
      {
        title: 'Paste the email content',
        description: 'Copy the suspicious email content (body text) and paste it into the input area. The more content you provide, the more accurate the analysis.',
        mediaType: 'screenshot',
        mediaPlaceholder: 'Screenshot: Email content pasted into scanner',
      },
      {
        title: 'Run the scan',
        description: 'Click the scan button. Our spam detection model uses NLP and TF-IDF vectorization to analyze the text for known spam and phishing patterns.',
        mediaType: 'screenshot',
        mediaPlaceholder: 'Screenshot: Scan in progress',
      },
      {
        title: 'Check the verdict',
        description: 'The scanner shows whether the email is ham (safe) or spam/phishing. If flagged, do not click any links in the original email.',
        mediaType: 'screenshot',
        mediaPlaceholder: 'Screenshot: Results showing spam/ham classification',
      },
    ],
  },
  {
    id: 'metadata-fetcher',
    title: 'Metadata Fetcher',
    subtitle: 'Get detailed security intel on any website',
    icon: HiOutlineShieldCheck,
    color: 'from-indigo-600 to-blue-500',
    accentBg: 'bg-indigo-500/10',
    accentBorder: 'border-indigo-500/20',
    accentText: 'text-indigo-400',
    image: metadataImage,
    steps: [
      {
        title: 'Open the Metadata Fetcher',
        description: 'Navigate to the Metadata section from the dashboard.',
        mediaType: 'screenshot',
        mediaPlaceholder: 'Screenshot: Metadata Fetcher section',
      },
      {
        title: 'Enter a domain or URL',
        description: 'Type the website domain you want to investigate (e.g., example.com). The tool works with both full URLs and plain domains.',
        mediaType: 'screenshot',
        mediaPlaceholder: 'Screenshot: Domain entered in input field',
      },
      {
        title: 'Fetch metadata',
        description: 'Click fetch to retrieve comprehensive information — SSL certificate details, WHOIS registration data, server headers, and security configurations.',
        mediaType: 'screenshot',
        mediaPlaceholder: 'Screenshot: Fetch button and loading state',
      },
      {
        title: 'Analyze the results',
        description: 'Review the detailed breakdown including SSL validity, domain age, registrar info, server type, and security headers (HSTS, CSP, X-Frame-Options). A risk level is automatically calculated.',
        mediaType: 'screenshot',
        mediaPlaceholder: 'Screenshot: Full metadata results with risk assessment',
      },
    ],
  },
  {
    id: 'takedown',
    title: 'Takedown Request',
    subtitle: 'Report and take down malicious websites',
    icon: HiOutlineExclamationCircle,
    color: 'from-red-600 to-orange-500',
    accentBg: 'bg-red-500/10',
    accentBorder: 'border-red-500/20',
    accentText: 'text-red-400',
    image: takedownImage,
    steps: [
      {
        title: 'Go to Takedown Request',
        description: 'Navigate to the Takedown section from the dashboard.',
        mediaType: 'screenshot',
        mediaPlaceholder: 'Screenshot: Takedown Request section',
      },
      {
        title: 'Enter the malicious URL',
        description: 'Provide the full URL of the malicious website you want to report. Make sure it\'s the exact URL, not a shortened version.',
        mediaType: 'screenshot',
        mediaPlaceholder: 'Screenshot: URL input field',
      },
      {
        title: 'Describe the threat',
        description: 'Write a detailed description of why this site is malicious — is it phishing, distributing malware, running a scam? The more detail, the faster the review.',
        mediaType: 'screenshot',
        mediaPlaceholder: 'Screenshot: Description textarea filled in',
      },
      {
        title: 'Upload screenshot evidence',
        description: 'Take a screenshot of the malicious website and upload it as evidence. This helps our admin team verify the threat quickly.',
        mediaType: 'screenshot',
        mediaPlaceholder: 'Screenshot: Screenshot upload area with preview',
      },
      {
        title: 'Submit and track',
        description: 'Click submit. Your request gets a tracking ID. Our team reviews it, identifies the hosting provider via WHOIS, and sends an abuse report to get the site taken down.',
        mediaType: 'screenshot',
        mediaPlaceholder: 'Screenshot: Submission confirmation with tracking ID',
      },
    ],
  },
];

function StepCard({ step, index }) {
  return (
    <div className="flex gap-5 items-start">
      {/* Step number */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
        {index + 1}
      </div>

      <div className="flex-1 space-y-3">
        {/* Text */}
        <div>
          <h4 className="text-white font-semibold text-lg">{step.title}</h4>
          <p className="text-gray-400 text-sm mt-1 leading-relaxed">{step.description}</p>
        </div>

        {/* Media placeholder */}
        <div className="bg-white/5 border-2 border-dashed border-white/10 rounded-xl overflow-hidden">
          {step.mediaSrc ? (
            step.mediaType === 'video' ? (
              <video
                src={step.mediaSrc}
                controls
                className="w-full rounded-xl"
                preload="metadata"
              />
            ) : (
              <img
                src={step.mediaSrc}
                alt={step.title}
                className="w-full rounded-xl object-cover"
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              {step.mediaType === 'video' ? (
                <HiOutlinePlay className="w-10 h-10 text-gray-600 mb-2" />
              ) : (
                <HiOutlinePhotograph className="w-10 h-10 text-gray-600 mb-2" />
              )}
              <p className="text-gray-500 text-xs">{step.mediaPlaceholder}</p>
              <p className="text-gray-600 text-[10px] mt-1">
                Add {step.mediaType === 'video' ? 'a video' : 'a screenshot'} here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GuideSection({ guide }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = guide.icon;

  return (
    <div className={`${guide.accentBg} border ${guide.accentBorder} rounded-2xl overflow-hidden transition-all`}>
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-5 p-6 text-left hover:bg-white/5 transition"
      >
        <img src={guide.image} alt={guide.title} className="w-16 h-16 object-contain flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`w-5 h-5 ${guide.accentText}`} />
            <h3 className="text-white font-bold text-xl">{guide.title}</h3>
          </div>
          <p className="text-gray-400 text-sm">{guide.subtitle}</p>
          <p className="text-gray-500 text-xs mt-1">{guide.steps.length} steps</p>
        </div>
        {expanded ? (
          <HiOutlineChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <HiOutlineChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {/* Steps — expandable */}
      {expanded && (
        <div className="px-6 pb-6 space-y-8 border-t border-white/5 pt-6">
          {guide.steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Solutions() {
  return (
    <section id="solutions-section" className="max-w-4xl mx-auto py-16 px-6">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-3">How It Works</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Step-by-step guides to help you use every tool on the Zentrya platform.
          Click on a tool below to see the walkthrough.
        </p>
      </div>

      {/* Guides */}
      <div className="space-y-4">
        {guides.map((guide) => (
          <GuideSection key={guide.id} guide={guide} />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-12">
        <p className="text-gray-500 text-sm">
          Still have questions? Ask our <span className="text-purple-400">SecBot</span> chatbot for help anytime.
        </p>
      </div>
    </section>
  );
}