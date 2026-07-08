import { useState } from 'react';
import { HiOutlineShieldCheck, HiOutlineGlobe, HiOutlineDocumentSearch, HiOutlineLockClosed, HiOutlineExclamation } from 'react-icons/hi';
import MetadataFetcher from '../features/tools/MetadataFetcher';
import metadataimage from '../assets/metadataimage.svg';

const features = [
    { icon: HiOutlineGlobe, title: 'WHOIS Lookup', desc: 'Registrar, creation date, country' },
    { icon: HiOutlineLockClosed, title: 'SSL Verification', desc: 'Certificate validity and issuer' },
    { icon: HiOutlineDocumentSearch, title: 'Security Headers', desc: 'HSTS, CSP, X-Frame-Options' },
    { icon: HiOutlineShieldCheck, title: 'Risk Assessment', desc: 'Automated risk calculation' },
];

const tips = [
    'Enter a plain domain (example.com) or full URL — both work',
    'Check domain age — newly registered domains are often suspicious',
    'Missing security headers (HSTS, CSP) indicate poor security practices',
    'Use this tool before entering credentials on unfamiliar websites',
];

export default function MetadataSection({ typoDomain, setTypoDomain }) {
    const [showScanner, setShowScanner] = useState(false);
    return (
        <section id="metadata-section" className="min-h-screen flex items-center justify-center py-6">
            <div className="w-full max-w-6xl mx-auto px-6 md:px-10 text-black">
                <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 w-full">
                    <div className="md:w-1/2 flex flex-col items-center justify-center">
                        <img src={metadataimage} alt="Metadata" className="w-[18rem] md:w-[24rem] lg:w-[28rem] h-[18rem] md:h-[24rem] lg:h-[28rem] object-contain" />
                        <div className="flex items-center gap-2 bg-black/5 rounded-full px-5 py-2 mt-5">
                            <HiOutlineShieldCheck className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-600">Comprehensive website intelligence</span>
                        </div>
                    </div>

                    <div className="md:w-1/2 flex flex-col items-center text-center">
                        {!showScanner ? (
                            <div className="flex flex-col items-center gap-5 w-full">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100">
                                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                    <span className="text-sm text-purple-700 font-medium">Website Intelligence</span>
                                </div>

                                <h2 className="text-4xl md:text-5xl font-bold">Metadata<br />Fetching</h2>
                                <p className="text-base max-w-md text-gray-600 leading-relaxed">
                                    Enter any domain to retrieve security intelligence — SSL certificates, WHOIS data, server headers, and an automated risk assessment.
                                </p>

                                <button
                                    className="w-full max-w-sm py-3.5 rounded-xl bg-black text-white font-semibold text-lg transition hover:bg-gray-800 hover:shadow-lg"
                                    onClick={() => setShowScanner(true)}
                                >
                                    Start Fetching
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
                                    <MetadataFetcher typoDomain={typoDomain} setTypoDomain={setTypoDomain} setShowRecentScans={() => {}} light />
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
