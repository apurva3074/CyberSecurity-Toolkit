import { API_BASE_URL } from '../../config';
import { fetchWithRetry } from '../../lib/fetchWithRetry';
import { useState } from "react";

function UrlScanner({ urlInput, setUrlInput, light }) {
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleScan = async () => {
        setError('');
        setResult(null);
        let url = urlInput.trim();
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
            setUrlInput(url);
        }
        setLoading(true);
        try {
            const response = await fetchWithRetry(`${API_BASE_URL}/api/phishing/predict/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            const data = await response.json();
            if (response.ok) {
                if (data.url_exists === false) {
                    setError(data.warning || 'This website does not exist or is unreachable.');
                } else {
                    setResult(data.phishing ? 'phishing' : 'safe');
                    setShowModal(true);
                }
            } else {
                setError(data.error || 'Error occurred.');
            }
        } catch {
            setError('Network error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h2 className={`${light ? 'text-black' : 'text-white'} text-4xl font-semibold mb-4`}>Start Scanning</h2>
            <p className={`${light ? 'text-[#6D4E9F]' : 'text-purple-400'} mb-2 font-semibold`}>Paste your suspicious link here</p>
            <input
                type="text"
                placeholder="Enter suspicious URL"
                className={`w-full p-3 rounded-2xl mb-4 text-base focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 ${light ? 'bg-white text-black' : 'bg-white/5 border border-white/10 text-white placeholder-gray-500'}`}
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
            />
            <button
                onClick={handleScan}
                className={`px-6 py-4 rounded-2xl font-semibold w-full flex items-center justify-center transition ${light ? 'bg-black text-white hover:bg-gray-800' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'}`}
                disabled={loading}
            >
                {loading && <span className="spinner"></span>}
                {loading ? "Scanning..." : "Start Scanning"}
            </button>
            {error && <div className={`mt-4 ${light ? 'text-red-600' : 'text-red-400'}`}>{error}</div>}

            {showModal && result && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 animate-fadeIn" onClick={() => setShowModal(false)}>
                    <div className="bg-[#111119] border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            {result === "phishing" ? (
                                <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-5xl">⚠️</span>
                                </div>
                            ) : (
                                <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-5xl">✅</span>
                                </div>
                            )}
                            <h3 className="text-2xl font-bold mb-2 text-white">
                                {result === "phishing" ? "Warning: Phishing Detected!" : "URL is Safe"}
                            </h3>
                            <p className="text-gray-400 mb-6">
                                {result === "phishing"
                                    ? "This URL has been identified as a potential phishing site. Do not enter any personal information or credentials."
                                    : "This URL appears to be safe. No phishing indicators were detected."}
                            </p>
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default UrlScanner;

export const toolInfo = {
    id: 'url',
    title: 'URL Scanner',
    description: 'Scan URLs for phishing and scams.'
};
