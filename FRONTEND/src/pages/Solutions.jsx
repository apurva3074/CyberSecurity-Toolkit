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
        mediaSrc: '/URL_SCANNER1.png',
      },
      {
        title: 'Click the Scan button',
        description: 'Type or paste the full URL you want to check into the input field. Include https:// for best results.',
        mediaType: 'screenshot',
        mediaSrc: '/URL_SCANNER2.png',
      },
      {
        title: 'Enter the suspicious URL, Click "Scan URL"',
        description: 'Hit the scan button to analyze the URL. Our AI model evaluates 11+ features including domain age, SSL status, and URL patterns.',
        mediaType: 'screenshot',
        mediaSrc: '/URL_SCANNER3.png',
      },
      {
        title: 'Review the results',
        description: 'The scanner will show whether the URL is safe or a phishing threat. If flagged as phishing, avoid visiting the site and consider submitting a takedown request.',
        mediaType: 'screenshot',
        mediaSrc: '/URL_SCANNER4.png',
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
        mediaSrc: '/EMAIL_SCANNER1.png',
      },
      {
        title: 'Click on Email Scanning ',
        description: 'Copy the suspicious email content (body text) and paste it into the input area. The more content you provide, the more accurate the analysis.',
        mediaType: 'screenshot',
        mediaSrc: '/EMAIL_SCANNER2.png',
      },
      {
        title: 'Enter your Email',
        description: 'Click the scan button. Our spam detection model uses NLP and TF-IDF vectorization to analyze the text for known spam and phishing patterns.',
        mediaType: 'screenshot',
        mediaSrc: '/EMAIL_SCANNER3.png',
      },
      {
        title: 'Check the verdict',
        description: 'The scanner shows whether the email is ham (safe) or spam/phishing. If flagged, do not click any links in the original email.',
        mediaType: 'screenshot',
        mediaSrc: '/EMAIL_SCANNER4.png',
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
        mediaSrc: '/METADATA_FETCHER1.png',
      },
      {
        title: 'Enter a domain or URL',
        description: 'Type the website domain you want to investigate (e.g., example.com). The tool works with both full URLs and plain domains.',
        mediaType: 'screenshot',
        mediaSrc: '/METADATA_FETCHER2.png',
      },
      {
        title: 'Fetch metadata',
        description: 'Click fetch to retrieve comprehensive information — SSL certificate details, WHOIS registration data, server headers, and security configurations.',
        mediaType: 'screenshot',
        mediaSrc: '/METADATA_FETCHER3.png',
      },
      {
        title: 'Analyze the results',
        description: 'Review the detailed breakdown including SSL validity, domain age, registrar info, server type, and security headers (HSTS, CSP, X-Frame-Options). A risk level is automatically calculated.',
        mediaType: 'screenshot',
        mediaSrc: '/METADATA_FETCHER4.png',
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
        mediaSrc: '/TAKEDOWN_REQUESTS1.png',
      },
      {
        title: 'Enter the malicious URL',
        description: 'Provide the full URL of the malicious website you want to report. Make sure it is the exact URL, not a shortened version.',
        mediaType: 'screenshot',
        mediaSrc: '/TAKEDOWN_REQUESTS2.png',
      },
      {
        title: 'Describe the threat',
        description: 'Write a detailed description of why this site is malicious — phishing, malware, scam, etc.',
        mediaType: 'screenshot',
        mediaSrc: '/TAKEDOWN_REQUESTS3.png',
      },
      {
        title: 'Upload screenshot evidence',
        description: 'Take a screenshot of the malicious website and upload it as evidence.',
        mediaType: 'screenshot',
        mediaSrc: '/TAKEDOWN_REQUESTS4.png',
      },
      {
        title: 'Submit and track',
        description: 'Click submit. Your request gets a tracking ID and our team reviews the report.',
        mediaType: 'screenshot',
        mediaSrc: '/TAKEDOWN_REQUESTS5.png',
      },
    ],
  },
];



function StepCard({ step, index }) {
  return (
    <div className="flex gap-3 sm:gap-5 items-start">
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
        className="w-full flex items-center gap-3 sm:gap-5 p-4 sm:p-6 text-left hover:bg-white/5 transition"
      >
        <img src={guide.image} alt={guide.title} className="w-16 h-16 object-contain flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`w-5 h-5 ${guide.accentText} flex-shrink-0`} />
            <h3 className="text-white font-bold text-base sm:text-xl truncate">{guide.title}</h3>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm">{guide.subtitle}</p>
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
        <div className="px-4 sm:px-6 pb-6 space-y-8 border-t border-white/5 pt-6">
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
    <section id="solutions-section" className="max-w-5xl mx-auto py-16 px-6">
      {/* Page Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-sm text-purple-300 font-medium">Step-by-Step Guides</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Learn how to use every tool on the Zentrya platform with detailed walkthroughs.
          Click on a tool below to expand the guide.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-purple-400">4</p>
          <p className="text-gray-500 text-sm mt-1">Tools Available</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-blue-400">15+</p>
          <p className="text-gray-500 text-sm mt-1">Step-by-Step Guides</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-green-400">2 min</p>
          <p className="text-gray-500 text-sm mt-1">Avg. Setup Time</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-yellow-400">Free</p>
          <p className="text-gray-500 text-sm mt-1">All Features</p>
        </div>
      </div>

      {/* Guides */}
      <div className="space-y-4">
        {guides.map((guide) => (
          <GuideSection key={guide.id} guide={guide} />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-14 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Need more help?</h3>
        <p className="text-gray-400 text-sm mb-1">
          Our <span className="text-purple-400 font-semibold">SecBot</span> AI chatbot is available 24/7 to answer your questions and guide you through any tool.
        </p>
        <p className="text-gray-500 text-xs">Look for the chat icon in the bottom-right corner of the screen.</p>
      </div>
    </section>
  );
}