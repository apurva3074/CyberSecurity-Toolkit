import { useState } from 'react';
import { HiOutlineShieldCheck, HiOutlineLightningBolt, HiOutlineDatabase, HiOutlineLockClosed, HiOutlineExclamation } from 'react-icons/hi';
import UrlScanner from '../features/tools/UrlScanner';
import urlscanimage from '../assets/urlscanimage.svg';

const features = [
    { icon: HiOutlineLightningBolt, title: 'Instant Analysis', desc: 'Results in under 2 seconds' },
    { icon: HiOutlineDatabase, title: '11+ Features', desc: 'Domain age, SSL, URL patterns' },
    { icon: HiOutlineShieldCheck, title: 'AI-Powered', desc: 'Trained on thousands of sites' },
    { icon: HiOutlineLockClosed, title: 'Privacy First', desc: 'Scanned in real-time, never stored' },
];

const tips = [
    'Always include https:// for best results',
    'Check shortened URLs (bit.ly, tinyurl) — they often hide phishing sites',
    'Look for misspellings in domain names (e.g. g00gle.com)',
    'If flagged as phishing, do not visit the site or enter any credentials',
];

export default function UrlSection({ urlInput, setUrlInput }) {
    const [showScanner, setShowScanner] = useState(false);
    return (
        <section id="url-section" className="min-h-screen flex items-center justify-center py-6">
            <div className="w-full max-w-6xl mx-auto px-6 md:px-10 text-black">
                <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 w-full">
                    <div className="md:w-1/2 flex flex-col items-center justify-center">
                        <img src={urlscanimage} alt="Phishing Link" className="w-[18rem] md:w-[24rem] lg:w-[28rem] h-[18rem] md:h-[24rem] lg:h-[28rem] object-contain" />
                        <div className="flex items-center gap-2 bg-black/5 rounded-full px-5 py-2 mt-5">
                            <HiOutlineShieldCheck className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-600">Trusted by security professionals</span>
                        </div>
                    </div>

                    <div className="md:w-1/2 flex flex-col items-center text-center">
                        {!showScanner ? (
                            <div className="flex flex-col items-center gap-5 w-full">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100">
                                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                    <span className="text-sm text-purple-700 font-medium">URL Threat Detection</span>
                                </div>

                                <h2 className="text-4xl md:text-5xl font-bold">Phishing Link<br />Detection</h2>
                                <p className="text-base max-w-md text-gray-600 leading-relaxed">
                                    Paste any suspicious URL and our AI-powered scanner will instantly analyze it for phishing indicators, malware, and scam patterns.
                                </p>

                                <button
                                    className="w-full max-w-sm py-3.5 rounded-xl bg-black text-white font-semibold text-lg transition hover:bg-gray-800 hover:shadow-lg"
                                    onClick={() => setShowScanner(true)}
                                >
                                    Start Scanning
                                </button>

                                <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                                    {features.map((f) => {
                                        const Icon = f.icon;
                                        return (
                                            <div key={f.title} className="flex items-center gap-3 p-3.5 rounded-xl bg-black/[0.03] border border-black/5">
                                                <Icon className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                                <div className="text-left">
                                                    <span className="text-sm font-semibold text-gray-800 block">{f.title}</span>
                                                    <span className="text-xs text-gray-500">{f.desc}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full flex flex-col gap-4">
                                <div className="w-full bg-[#D9C5F53B] rounded-2xl p-5 md:p-6">
                                    <UrlScanner urlInput={urlInput} setUrlInput={setUrlInput} light />
                                </div>

                                <div className="w-full bg-black/[0.03] border border-black/5 rounded-xl p-4 text-left">
                                    <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                                        <HiOutlineExclamation className="w-4 h-4 text-amber-500" />
                                        Quick Tips
                                    </h4>
                                    <ul className="space-y-1.5">
                                        {tips.map((tip, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                                <span className="text-purple-500 mt-0.5 flex-shrink-0">•</span>
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    onClick={() => setShowScanner(false)}
                                    className="text-sm text-purple-600 hover:text-purple-800 font-medium transition self-center"
                                >
                                    ← Back to overview
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
