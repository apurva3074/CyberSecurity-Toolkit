import { useState } from 'react';
import { HiOutlineShieldCheck, HiOutlineExclamationCircle, HiOutlineDocumentText, HiOutlineMail, HiOutlineExclamation } from 'react-icons/hi';
import TakedownRequest from '../features/tools/TakedownRequest';
import takedownimage from '../assets/takedownimage.svg';

const features = [
    { icon: HiOutlineExclamationCircle, title: 'Report Threats', desc: 'Submit malicious URLs for removal' },
    { icon: HiOutlineDocumentText, title: 'Evidence Upload', desc: 'Attach screenshots as proof' },
    { icon: HiOutlineMail, title: 'Abuse Reports', desc: 'Emails sent to hosting providers' },
    { icon: HiOutlineShieldCheck, title: 'Track Progress', desc: 'Monitor request status live' },
];

const tips = [
    'Include the full URL of the malicious website, not a shortened link',
    'Describe the threat clearly — phishing, scam, malware, impersonation, etc.',
    'Upload a screenshot of the malicious site as evidence for faster processing',
    'After submission, you can track your request status with the tracking ID',
];

export default function TakedownSection({ takedownDomain, setTakedownDomain, takedownReason, setTakedownReason }) {
    const [showScanner, setShowScanner] = useState(false);
    return (
        <section id="takedown-section" className="min-h-screen flex items-center justify-center py-6">
            <div className="w-full max-w-6xl mx-auto px-6 md:px-10 text-white">
                <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 w-full">
                    <div className={`md:w-1/2 flex-col items-center justify-center ${showScanner ? 'hidden md:flex' : 'flex'}`}>
                        <img src={takedownimage} alt="Takedown" className="w-[18rem] md:w-[24rem] lg:w-[28rem] h-[18rem] md:h-[24rem] lg:h-[28rem] object-contain" />
                        <div className="hidden md:flex items-center gap-2 bg-white/5 rounded-full px-5 py-2 mt-5">
                            <HiOutlineShieldCheck className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-medium text-gray-400">Admin-reviewed takedown process</span>
                        </div>
                    </div>

                    <div className="md:w-1/2 flex flex-col items-center text-center">
                        {!showScanner ? (
                            <div className="flex flex-col items-center gap-5 w-full">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                                    <span className="text-sm text-red-300 font-medium">Threat Removal</span>
                                </div>

                                <h2 className="text-4xl md:text-5xl font-bold">Takedown<br />Requests</h2>
                                <p className="text-base max-w-md text-gray-400 leading-relaxed">
                                    Report malicious websites for removal. Submit the URL, describe the threat, and upload evidence — our team contacts the hosting provider.
                                </p>

                                <button
                                    className="w-full max-w-sm py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-lg transition hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg"
                                    onClick={() => setShowScanner(true)}
                                >
                                    Start Takedown Request
                                </button>

                                <div className="hidden md:grid grid-cols-2 gap-3 w-full max-w-md">
                                    {features.map((f) => {
                                        const Icon = f.icon;
                                        return (
                                            <div key={f.title} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                                                <Icon className="w-5 h-5 text-purple-400 flex-shrink-0" />
                                                <div className="text-left">
                                                    <span className="text-sm font-semibold text-white block">{f.title}</span>
                                                    <span className="text-xs text-gray-500">{f.desc}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full flex flex-col gap-4">
                                <div className="w-full bg-purple-500/5 border border-purple-500/10 rounded-2xl p-5 md:p-6">
                                    <TakedownRequest
                                        takedownDomain={takedownDomain}
                                        setTakedownDomain={setTakedownDomain}
                                        takedownReason={takedownReason}
                                        setTakedownReason={setTakedownReason}
                                        setShowRecentScans={() => {}}
                                    />
                                </div>

                                <div className="w-full bg-white/[0.03] border border-white/5 rounded-xl p-4 text-left">
                                    <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                        <HiOutlineExclamation className="w-4 h-4 text-amber-400" />
                                        Quick Tips
                                    </h4>
                                    <ul className="space-y-1.5">
                                        {tips.map((tip, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                                                <span className="text-purple-400 mt-0.5 flex-shrink-0">•</span>
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    onClick={() => setShowScanner(false)}
                                    className="text-sm text-purple-400 hover:text-purple-300 font-medium transition self-center"
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
