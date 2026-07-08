import { API_BASE_URL } from '../../config';
import { useState } from "react";
import '../../styles/customScrollbar.css';

export default function MetadataFetcher({ typoDomain, setTypoDomain, setShowRecentScans, light }) {
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

        let url = typoDomain.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
            setTypoDomain(url);
        }

        setLoading(true);
        setShowRecentScans?.(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/metadata/metadata/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
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
        if (light) {
            return (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isSafe ? 'bg-emerald-100 text-emerald-800' : isWarning ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                    {risk}
                </span>
            );
        }
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isSafe ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : isWarning ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                {risk}
            </span>
        );
    };

    return (
        <>
            <h2 className={`${light ? 'text-black' : 'text-white'} text-4xl font-semibold mb-4`}>Start Fetching</h2>
            <p className={`${light ? 'text-[#6D4E9F]' : 'text-purple-400'} mb-2 font-semibold`}>Paste your domain or website here</p>
            <input
                type="text"
                placeholder="example.com or https://example.com"
                className={`w-full p-3 rounded-2xl mb-4 text-base focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 ${light ? 'bg-white text-black' : 'bg-white/5 border border-white/10 text-white placeholder-gray-500'}`}
                value={typoDomain}
                onChange={e => setTypoDomain(e.target.value)}
            />
            <button
                onClick={handleFetch}
                disabled={loading}
                className={`px-6 py-4 rounded-2xl font-semibold w-full flex items-center justify-center transition ${loading ? 'opacity-60 cursor-not-allowed' : ''} ${light ? 'bg-black text-white hover:bg-gray-800' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'}`}
            >
                {loading && <span className={light ? 'spinner-dark' : 'spinner'}></span>}
                {loading ? 'Fetching...' : 'Fetch Metadata'}
            </button>
            {error && (
                <div className={`mt-4 p-3 rounded ${light ? 'bg-red-100 text-red-800' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>{error}</div>
            )}
            {result && (
                <div className="mt-6 w-full text-left max-h-[450px] overflow-y-auto custom-scrollbar">
                    <h3 className={`text-lg font-semibold mb-4 ${light ? 'text-black' : 'text-white'}`}>Metadata Results</h3>
                    <div className={`p-4 rounded-lg flex items-center gap-4 mb-4 ${light ? 'bg-white shadow' : 'bg-white/5 border border-white/10'}`}>
                        <div className={`w-16 h-16 flex items-center justify-center rounded ${light ? 'bg-gray-50' : 'bg-white/5'}`}>
                            {result.website_info?.favicon && result.website_info.favicon !== 'N/A' ? (
                                <img src={result.website_info.favicon} alt="favicon" className="w-12 h-12 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            ) : (
                                <div className="text-2xl text-gray-400">🌐</div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className={`text-lg font-semibold ${light ? 'text-gray-900' : 'text-white'}`}>{result.website_info?.title ?? 'Untitled'}</div>
                                    <a href={result.url} target="_blank" rel="noreferrer" className={`text-sm hover:underline ${light ? 'text-purple-600' : 'text-purple-400'}`}>{result.url}</a>
                                </div>
                                <div className="text-right">
                                    <RiskBadge risk={result.risk_level ?? 'N/A'} />
                                    <div className="text-xs text-gray-500 mt-1">Updated just now</div>
                                </div>
                            </div>
                            {result.website_info?.description && result.website_info.description !== 'N/A' && (
                                <p className={`mt-2 text-sm ${light ? 'text-gray-600' : 'text-gray-400'}`}>{result.website_info.description}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-4 border rounded ${light ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                            <h4 className={`font-semibold mb-2 ${light ? 'text-gray-900' : 'text-white'}`}>SSL</h4>
                            {result.ssl_info?.error ? (
                                <div className={`text-sm ${light ? 'text-gray-600' : 'text-gray-400'}`}>{result.ssl_info.error}</div>
                            ) : (
                                <div className={`text-sm space-y-1 ${light ? 'text-gray-700' : 'text-gray-300'}`}>
                                    <div><strong>Issuer:</strong> {result.ssl_info?.issuer ?? 'N/A'}</div>
                                    <div><strong>Valid From:</strong> {result.ssl_info?.valid_from ?? 'N/A'}</div>
                                    <div><strong>Valid To:</strong> {result.ssl_info?.valid_to ?? 'N/A'}</div>
                                    <div className="flex items-center gap-2"><strong>Valid:</strong> {typeof result.ssl_info?.ssl_valid === 'boolean' ? (result.ssl_info.ssl_valid ? <span className={light ? 'text-emerald-600' : 'text-emerald-400'}>Yes</span> : <span className={light ? 'text-red-600' : 'text-red-400'}>No</span>) : 'N/A'}</div>
                                </div>
                            )}
                        </div>

                        <div className={`p-4 border rounded ${light ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                            <h4 className={`font-semibold mb-2 ${light ? 'text-gray-900' : 'text-white'}`}>Domain / WHOIS</h4>
                            {result.domain_info?.error ? (
                                <div className={`text-sm ${light ? 'text-gray-600' : 'text-gray-400'}`}>{result.domain_info.error}</div>
                            ) : (
                                <div className={`text-sm space-y-1 ${light ? 'text-gray-700' : 'text-gray-300'}`}>
                                    <div><strong>Registrar:</strong> {result.domain_info?.registrar ?? 'N/A'}</div>
                                    <div><strong>Created:</strong> {result.domain_info?.creation_date ?? 'N/A'}</div>
                                    <div><strong>Expires:</strong> {result.domain_info?.expiration_date ?? 'N/A'}</div>
                                    <div><strong>Country:</strong> {result.domain_info?.country ?? 'N/A'}</div>
                                </div>
                            )}
                        </div>

                        <div className={`p-4 border rounded ${light ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                            <h4 className={`font-semibold mb-2 ${light ? 'text-gray-900' : 'text-white'}`}>Server & Headers</h4>
                            <div className={`text-sm space-y-1 ${light ? 'text-gray-700' : 'text-gray-300'}`}>
                                <div><strong>Server:</strong> {result.server_info?.server ?? 'N/A'}</div>
                                <div><strong>Content Type:</strong> {result.server_info?.content_type ?? 'N/A'}</div>
                                <div className="mt-2"><strong>Security Headers:</strong>
                                    <div className="flex gap-2 mt-1">
                                        <span className={`px-2 py-1 text-xs rounded ${result.server_info?.security_headers?.HSTS ? (light ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/10 text-emerald-400') : (light ? 'bg-gray-100 text-gray-700' : 'bg-white/5 text-gray-500')}`}>HSTS</span>
                                        <span className={`px-2 py-1 text-xs rounded ${result.server_info?.security_headers?.CSP ? (light ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/10 text-emerald-400') : (light ? 'bg-gray-100 text-gray-700' : 'bg-white/5 text-gray-500')}`}>CSP</span>
                                        <span className={`px-2 py-1 text-xs rounded ${result.server_info?.security_headers?.['X-Frame-Options'] ? (light ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/10 text-emerald-400') : (light ? 'bg-gray-100 text-gray-700' : 'bg-white/5 text-gray-500')}`}>X-Frame-Options</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 border rounded ${light ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                            <h4 className={`font-semibold mb-2 ${light ? 'text-gray-900' : 'text-white'}`}>Risk</h4>
                            <div className={`text-sm ${light ? 'text-gray-700' : 'text-gray-300'}`}>
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
