import { API_BASE_URL } from '../../config';
import { useState } from "react";
import '../../styles/customScrollbar.css';

export default function MetadataFetcher({ typoDomain, setTypoDomain, setShowRecentScans }) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    async function handleFetch() {
        setError(null);
        setResult(null);
        if (!typoDomain || typoDomain.trim() === "") {
            setError('Please enter a domain or URL.');
            return;
        }

        setLoading(true);
        setShowRecentScans?.(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/metadata/metadata/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: typoDomain.trim() })
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                const message = (data && (data.error || JSON.stringify(data))) || res.statusText;
                setError(message || `Request failed: ${res.status}`);
            } else {
                setResult(data);
            }
        } catch (e) {
            setError(String(e));
        } finally {
            setLoading(false);
        }
    }

    const RiskBadge = ({ risk }) => {
        const isSafe = risk && (risk.includes('Safe') || risk === '✅ Safe');
        const isWarning = risk && risk.includes('⚠️');
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isSafe ? 'bg-emerald-100 text-emerald-800' : isWarning ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                {risk}
            </span>
        );
    };

    return (
        <>
            <h2 className="text-black text-4xl font-semibold mb-4">Start Fetching</h2>
            <p className="text-[#6D4E9F] mb-2 font-semibold">Paste your domain or website here</p>
            <input
                type="text"
                placeholder="example.com or https://example.com"
                className="w-full p-3 bg-white text-black rounded-2xl mb-4 text-base"
                value={typoDomain}
                onChange={e => setTypoDomain(e.target.value)}
            />
            <button
                onClick={handleFetch}
                disabled={loading}
                className={`px-6 py-4 rounded-2xl bg-black text-white font-semibold w-full max-w-xs flex items-center justify-center hover:bg-gray-800 transition ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
                {loading && <span className="spinner"></span>}
                {loading ? 'Fetching...' : 'Fetch Metadata'}
            </button>
            {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>
            )}
            {result && (
                <div className="mt-6 w-full text-left max-h-[450px] overflow-y-auto custom-scrollbar">
                    <h3 className="text-lg font-semibold mb-4">Metadata Results</h3>
                    <div className="p-4 bg-white rounded-lg shadow flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 flex items-center justify-center bg-gray-50 rounded">
                            {result.website_info?.favicon && result.website_info.favicon !== 'N/A' ? (
                                <img src={result.website_info.favicon} alt="favicon" className="w-12 h-12 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            ) : (
                                <div className="text-2xl text-gray-400">🌐</div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="text-lg font-semibold text-gray-900">{result.website_info?.title ?? 'Untitled'}</div>
                                    <a href={result.url} target="_blank" rel="noreferrer" className="text-sm text-purple-600 hover:underline">{result.url}</a>
                                </div>
                                <div className="text-right">
                                    <RiskBadge risk={result.risk_level ?? 'N/A'} />
                                    <div className="text-xs text-gray-500 mt-1">Updated just now</div>
                                </div>
                            </div>
                            {result.website_info?.description && result.website_info.description !== 'N/A' && (
                                <p className="mt-2 text-sm text-gray-600">{result.website_info.description}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded bg-white">
                            <h4 className="font-semibold mb-2 text-gray-900">SSL</h4>
                            {result.ssl_info?.error ? (
                                <div className="text-sm text-gray-600">{result.ssl_info.error}</div>
                            ) : (
                                <div className="text-sm text-gray-700 space-y-1">
                                    <div><strong>Issuer:</strong> {result.ssl_info?.issuer ?? 'N/A'}</div>
                                    <div><strong>Valid From:</strong> {result.ssl_info?.valid_from ?? 'N/A'}</div>
                                    <div><strong>Valid To:</strong> {result.ssl_info?.valid_to ?? 'N/A'}</div>
                                    <div className="flex items-center gap-2"><strong>Valid:</strong> {typeof result.ssl_info?.ssl_valid === 'boolean' ? (result.ssl_info.ssl_valid ? <span className="text-emerald-600">Yes</span> : <span className="text-red-600">No</span>) : 'N/A'}</div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border rounded bg-white">
                            <h4 className="font-semibold mb-2 text-gray-900">Domain / WHOIS</h4>
                            {result.domain_info?.error ? (
                                <div className="text-sm text-gray-600">{result.domain_info.error}</div>
                            ) : (
                                <div className="text-sm text-gray-700 space-y-1">
                                    <div><strong>Registrar:</strong> {result.domain_info?.registrar ?? 'N/A'}</div>
                                    <div><strong>Created:</strong> {result.domain_info?.creation_date ?? 'N/A'}</div>
                                    <div><strong>Expires:</strong> {result.domain_info?.expiration_date ?? 'N/A'}</div>
                                    <div><strong>Country:</strong> {result.domain_info?.country ?? 'N/A'}</div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border rounded bg-white">
                            <h4 className="font-semibold mb-2 text-gray-900">Server & Headers</h4>
                            <div className="text-sm text-gray-700 space-y-1">
                                <div><strong>Server:</strong> {result.server_info?.server ?? 'N/A'}</div>
                                <div><strong>Content Type:</strong> {result.server_info?.content_type ?? 'N/A'}</div>
                                <div className="mt-2"><strong>Security Headers:</strong>
                                    <div className="flex gap-2 mt-1">
                                        <span className={`px-2 py-1 text-xs rounded ${result.server_info?.security_headers?.HSTS ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>HSTS</span>
                                        <span className={`px-2 py-1 text-xs rounded ${result.server_info?.security_headers?.CSP ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>CSP</span>
                                        <span className={`px-2 py-1 text-xs rounded ${result.server_info?.security_headers?.['X-Frame-Options'] ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>X-Frame-Options</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border rounded bg-white">
                            <h4 className="font-semibold mb-2 text-gray-900">Risk</h4>
                            <div className="text-sm text-gray-700">
                                <RiskBadge risk={result.risk_level ?? 'N/A'} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export const toolInfo = {
    id: 'metadata',
    title: 'Metadata Fetching',
    description: 'Retrieve detailed metadata and security information for any website or domain.'
};