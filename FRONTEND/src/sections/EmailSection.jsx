import { useState } from 'react';
import { HiOutlineShieldCheck, HiOutlineMail, HiOutlineSearch, HiOutlineLockClosed, HiOutlineExclamation, HiOutlineClipboardList, HiOutlineInbox } from 'react-icons/hi';
import { ManualEmailScanner, GmailScanner } from '../features/tools/EmailScanner';
import emailscanimage from '../assets/emailscanimage.svg';

const features = [
    { icon: HiOutlineMail, title: 'Gmail Integration', desc: 'Connect Gmail to auto-scan inbox' },
    { icon: HiOutlineSearch, title: 'NLP Analysis', desc: 'TF-IDF detects spam patterns' },
    { icon: HiOutlineShieldCheck, title: 'Spam & Phishing', desc: 'Identifies both spam and phishing' },
    { icon: HiOutlineLockClosed, title: 'No Data Stored', desc: 'Content analyzed and discarded' },
];

const manualTips = [
    'Paste the full email body text for the most accurate results',
    'Be suspicious of emails creating urgency or asking for credentials',
    'Check for misspelled sender addresses and generic greetings',
    'If flagged as spam, avoid clicking any links in the original email',
];

const gmailTips = [
    'Connect securely via Google OAuth — we never see your password',
    'Up to 20 recent emails are scanned and classified automatically',
    'Emails flagged as risky should not be interacted with',
    'You can rescan anytime to check newer emails',
];

export default function EmailSection() {
    const [view, setView] = useState('overview');

    return (
        <section id="email-section" className="min-h-screen flex items-center justify-center py-6">
            <div className="w-full max-w-6xl mx-auto px-6 md:px-10 text-white">
                <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 w-full">
                    <div className="md:w-1/2 flex flex-col items-center text-center">
                        {view === 'overview' ? (
                            <div className="flex flex-col items-center gap-5 w-full">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                                    <span className="text-sm text-purple-300 font-medium">Email Threat Detection</span>
                                </div>

                                <h2 className="text-4xl md:text-5xl font-bold">Email<br />Scanning</h2>
                                <p className="text-base max-w-md text-gray-400 leading-relaxed">
                                    Analyze emails for spam, phishing, and fraudulent patterns. Paste email content manually or connect your Gmail for automated scanning.
                                </p>

                                <div className="flex flex-col gap-3 w-full max-w-sm">
                                    <button
                                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-lg transition hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg flex items-center justify-center gap-2"
                                        onClick={() => setView('manual')}
                                    >
                                        <HiOutlineClipboardList className="w-5 h-5" />
                                        Paste & Scan Email
                                    </button>
                                    <button
                                        className="w-full py-3.5 rounded-xl border border-white/20 text-white font-semibold text-lg transition hover:bg-white/5 hover:border-white/40 flex items-center justify-center gap-2"
                                        onClick={() => setView('gmail')}
                                    >
                                        <HiOutlineInbox className="w-5 h-5" />
                                        Connect Gmail
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 w-full max-w-md">
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
                        ) : view === 'manual' ? (
                            <div className="w-full flex flex-col gap-4">
                                <div className="w-full bg-purple-500/5 border border-purple-500/10 rounded-2xl p-5 md:p-6">
                                    <ManualEmailScanner />
                                </div>

                                <div className="w-full bg-white/[0.03] border border-white/5 rounded-xl p-4 text-left">
                                    <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                        <HiOutlineExclamation className="w-4 h-4 text-amber-400" />
                                        Quick Tips
                                    </h4>
                                    <ul className="space-y-1.5">
                                        {manualTips.map((tip, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                                                <span className="text-purple-400 mt-0.5 flex-shrink-0">•</span>
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex items-center justify-center gap-3">
                                    <button onClick={() => setView('overview')} className="text-sm text-purple-400 hover:text-purple-300 font-medium transition">← Back</button>
                                    <span className="text-gray-600">|</span>
                                    <button onClick={() => setView('gmail')} className="text-sm text-purple-400 hover:text-purple-300 font-medium transition">Gmail Scanner →</button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full flex flex-col gap-4">
                                <div className="w-full bg-purple-500/5 border border-purple-500/10 rounded-2xl p-5 md:p-6">
                                    <GmailScanner />
                                </div>

                                <div className="w-full bg-white/[0.03] border border-white/5 rounded-xl p-4 text-left">
                                    <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                        <HiOutlineExclamation className="w-4 h-4 text-amber-400" />
                                        Quick Tips
                                    </h4>
                                    <ul className="space-y-1.5">
                                        {gmailTips.map((tip, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                                                <span className="text-purple-400 mt-0.5 flex-shrink-0">•</span>
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex items-center justify-center gap-3">
                                    <button onClick={() => setView('overview')} className="text-sm text-purple-400 hover:text-purple-300 font-medium transition">← Back</button>
                                    <span className="text-gray-600">|</span>
                                    <button onClick={() => setView('manual')} className="text-sm text-purple-400 hover:text-purple-300 font-medium transition">← Manual Scanner</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="md:w-1/2 flex flex-col items-center justify-center">
                        <img src={emailscanimage} alt="Email Scanning" className="w-[18rem] md:w-[24rem] lg:w-[28rem] h-[18rem] md:h-[24rem] lg:h-[28rem] object-contain" />
                        <div className="flex items-center gap-2 bg-white/5 rounded-full px-5 py-2 mt-5">
                            <HiOutlineShieldCheck className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-medium text-gray-400">AI-powered spam & phishing detection</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
