import { API_BASE_URL } from '../../config';
import { useState } from "react";

function UrlScanner({ urlInput, setUrlInput }) {
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleScan = async () => {
        setError('');
        setResult(null);
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/phishing/predict/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: urlInput }),
            });
            const data = await response.json();
            if (response.ok) {
                setResult(data.phishing ? 'phishing' : 'safe');
                setShowModal(true);
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
            <h2 className="text-black text-4xl font-semibold mb-4">Start Scanning</h2>
            <p className="text-[#6D4E9F] mb-2 font-semibold">Paste your suspicious link here</p>
            <input
                type="text"
                placeholder="Enter suspicious URL"
                className="w-full p-3 bg-white rounded-2xl mb-4 text-base text-black"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
            />
            <button
                onClick={handleScan}
                className="px-6 py-4 rounded-2xl bg-black text-white font-semibold w-full max-w-xs flex items-center justify-center hover:bg-gray-800 transition"
                disabled={loading}
            >
                {loading && <span className="spinner"></span>}
                {loading ? "Scanning..." : "Start Scanning"}
            </button>
            {error && <div className="mt-4 text-red-600">{error}</div>}

            {showModal && result && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 animate-fadeIn" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            {result === "phishing" ? (
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-5xl">⚠️</span>
                                </div>
                            ) : (
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-5xl">✅</span>
                                </div>
                            )}
                            <h3 className="text-2xl font-bold mb-2 text-gray-900">
                                {result === "phishing" ? "Warning: Phishing Detected!" : "URL is Safe"}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {result === "phishing"
                                    ? "This URL has been identified as a potential phishing site. Do not enter any personal information or credentials."
                                    : "This URL appears to be safe. No phishing indicators were detected."}
                            </p>
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition"
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