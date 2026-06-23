import { useState } from 'react';
import MetadataFetcher from '../features/tools/MetadataFetcher';
import metadataimage from '../assets/metadataimage.svg';

export default function MetadataSection({ typoDomain, setTypoDomain }) {
    const [showScanner, setShowScanner] = useState(false);
    return (
        <section id="metadata-section" className="min-h-screen flex items-center justify-center bg-[#e9e9f7]">
            <div className="w-full max-w-6xl mx-auto p-4 md:p-8 text-black flex flex-col items-center gap-8" style={{ minHeight: '500px' }}>
                <div className="flex flex-col md:flex-row items-center gap-8 w-full">
                    <div className="md:w-1/2 flex justify-center items-center">
                        <img src={metadataimage} alt="Metadata" className="w-full max-w-[20rem] md:max-w-[30rem] lg:max-w-[40rem] h-auto object-contain" />
                    </div>
                    <div className="md:w-1/2 flex flex-col items-center text-center">
                        {!showScanner ? (
                            <>
                                <h2 className="text-4xl md:text-5xl font-semibold mb-4">Metadata Fetching</h2>
                                <p className="mb-6 text-lg font-normal text-center">
                                    <span className="text-purple-700 font-semibold">Metadata Fetching</span> - means collecting basic details about a website - like its title, description, and logo - without opening it.
                                </p>
                                <button
                                    className="w-full max-w-xs py-3 px-6 rounded-xl bg-black text-white font-semibold text-lg transition hover:bg-gray-800 hover:shadow-lg"
                                    onClick={() => setShowScanner(true)}
                                >
                                    Start Fetching
                                </button>
                            </>
                        ) : (
                            <div className="w-full bg-[#D9C5F53B] rounded-2xl p-6 md:p-8">
                                <MetadataFetcher typoDomain={typoDomain} setTypoDomain={setTypoDomain} setShowRecentScans={() => {}} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
