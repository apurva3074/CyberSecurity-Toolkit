import { useState } from 'react';
import EmailScanner from '../features/tools/EmailScanner';
import emailscanimage from '../assets/emailscanimage.svg';

export default function EmailSection() {
    const [showScanner, setShowScanner] = useState(false);
    return (
        <section id="email-section" className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-6xl mx-auto p-4 md:p-8 text-white flex flex-col items-center gap-8" style={{ minHeight: '500px' }}>
                <div className="flex flex-col md:flex-row items-center gap-8 w-full">
                    <div className="md:w-1/2 flex flex-col items-center text-center">
                        {!showScanner ? (
                            <>
                                <h2 className="text-4xl md:text-5xl font-semibold mb-4">Email Scanning</h2>
                                <p className="mb-6 text-lg max-w-md font-normal text-center text-gray-300">
                                    <span className="text-purple-400 font-semibold">Email Scanning</span> - refers to automatically inspecting emails for threats such as phishing, malware, spam, and fraudulent links.
                                </p>
                                <button
                                    className="w-full max-w-xs py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-lg transition hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg"
                                    onClick={() => setShowScanner(true)}
                                >
                                    Start Scanning
                                </button>
                            </>
                        ) : (
                            <div className="w-full bg-purple-500/5 border border-purple-500/10 rounded-2xl p-6 md:p-8">
                                <EmailScanner />
                            </div>
                        )}
                    </div>
                    <div className="md:w-1/2 flex justify-center items-center">
                        <img src={emailscanimage} alt="Email Scanning" className="w-full max-w-[20rem] md:max-w-[30rem] lg:max-w-[40rem] h-auto object-contain" />
                    </div>
                </div>
            </div>
        </section>
    );
}
