import { useEffect, useState, useCallback } from "react";
import { API_BASE_URL } from "../../config";
import {
    HiOutlineMail,
    HiOutlineShieldCheck,
    HiOutlineExclamation,
    HiOutlineRefresh,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
} from "react-icons/hi";

const GMAIL_TOKEN_KEY = "zentrya_gmail_token";

function EmailScanner() {
    const [emailText, setEmailText] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [gmailConnected, setGmailConnected] = useState(false);
    const [gmailMessages, setGmailMessages] = useState([]);
    const [gmailLoading, setGmailLoading] = useState(false);
    const [gmailError, setGmailError] = useState(null);
    const [showGmailResults, setShowGmailResults] = useState(false);

    const getToken = () => localStorage.getItem(GMAIL_TOKEN_KEY);

    const scanInbox = useCallback(async () => {
        const token = getToken();
        if (!token) return;

        setGmailLoading(true);
        setGmailError(null);
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/google/scan/?max_results=20&token=${token}`
            );
            const data = await response.json();
            if (response.ok) {
                setGmailMessages(data.messages || []);
                setShowGmailResults(true);
            } else if (response.status === 400) {
                localStorage.removeItem(GMAIL_TOKEN_KEY);
                setGmailConnected(false);
                setGmailError("Gmail session expired. Please reconnect.");
            } else {
                setGmailError(data.detail || "Error scanning inbox.");
            }
        } catch {
            setGmailError("Network error or server not reachable.");
        }
        setGmailLoading(false);
    }, []);

    // On mount: check if token exists in localStorage OR in URL params (from OAuth redirect)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get("gmail_token");

        if (urlToken) {
            localStorage.setItem(GMAIL_TOKEN_KEY, urlToken);
            setGmailConnected(true);
            window.history.replaceState({}, "", window.location.pathname);
        } else if (getToken()) {
            setGmailConnected(true);
        }
    }, []);

    // Auto-scan when connected
    useEffect(() => {
        if (gmailConnected && gmailMessages.length === 0) {
            scanInbox();
        }
    }, [gmailConnected, scanInbox]);

    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [showModal]);

    const handleScan = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/spam/predict/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: emailText }),
            });
            const data = await response.json();
            if (response.ok) {
                setResult(data.prediction);
                setShowModal(true);
            } else {
                setError(data.error || "Error scanning email.");
            }
        } catch {
            setError("Network error or server not reachable.");
        }
        setLoading(false);
    };

    const handleConnectGmail = () => {
        window.location.href = `${API_BASE_URL}/api/google/oauth2/start/`;
    };

    const safeCount = gmailMessages.filter(m => m.verdict?.includes("Safe") || m.verdict?.includes("Trusted")).length;
    const riskyCount = gmailMessages.filter(m => m.verdict?.includes("Risk") || m.verdict?.includes("Suspicious")).length;

    const getVerdictStyle = (verdict) => {
        if (!verdict) return { color: "text-gray-400", bg: "bg-gray-500/10" };
        if (verdict.includes("High Risk")) return { color: "text-red-400", bg: "bg-red-500/10" };
        if (verdict.includes("Suspicious")) return { color: "text-yellow-400", bg: "bg-yellow-500/10" };
        if (verdict.includes("Safe") || verdict.includes("Trusted")) return { color: "text-green-400", bg: "bg-green-500/10" };
        return { color: "text-gray-400", bg: "bg-gray-500/10" };
    };

    return (
        <>
            <h2 className="text-white text-4xl font-semibold mb-2">Email Scanner</h2>
            <p className="text-purple-400 text-sm font-semibold mb-4">Paste email content to check for spam/phishing</p>
            <textarea
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                placeholder="Paste your email content here..."
                rows={5}
                className="w-full p-3 bg-white/10 border border-white/10 text-white rounded-xl mb-4 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50"
            />
            <button
                onClick={handleScan}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold w-full max-w-xs flex items-center justify-center hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50"
                disabled={loading || !emailText.trim()}
            >
                {loading && <span className="spinner"></span>}
                {loading ? "Scanning..." : "Scan Email"}
            </button>
            {error && (
                <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">{error}</div>
            )}

            {/* Gmail Section */}
            <div className="mt-8 border-t border-white/10 pt-6">
                <h3 className="text-white text-xl font-semibold mb-2 flex items-center gap-2">
                    <HiOutlineMail className="w-5 h-5 text-purple-400" />
                    Gmail Inbox Scanner
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                    Connect your Gmail to automatically scan and classify your recent emails
                </p>

                {!gmailConnected ? (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                        <HiOutlineMail className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm mb-4">
                            Connect your Gmail to scan your inbox for phishing and suspicious senders
                        </p>
                        <button
                            onClick={handleConnectGmail}
                            className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition inline-flex items-center gap-2"
                        >
                            <HiOutlineMail className="w-4 h-4" />
                            Connect Gmail
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-2 text-green-400 text-sm">
                                <HiOutlineCheckCircle className="w-4 h-4" />
                                Gmail connected
                            </div>
                            <button
                                onClick={scanInbox}
                                className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition inline-flex items-center gap-2 disabled:opacity-50"
                                disabled={gmailLoading}
                            >
                                <HiOutlineRefresh className={`w-4 h-4 ${gmailLoading ? "animate-spin" : ""}`} />
                                {gmailLoading ? "Scanning..." : "Rescan Inbox"}
                            </button>
                        </div>

                        {gmailError && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">{gmailError}</div>
                        )}

                        {gmailLoading && gmailMessages.length === 0 && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                                <div className="spinner mx-auto mb-3"></div>
                                <p className="text-gray-400 text-sm">Scanning your inbox and analyzing senders...</p>
                            </div>
                        )}

                        {showGmailResults && gmailMessages.length > 0 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                                        <p className="text-2xl font-bold text-white">{gmailMessages.length}</p>
                                        <p className="text-gray-500 text-xs">Scanned</p>
                                    </div>
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                                        <p className="text-2xl font-bold text-green-400">{safeCount}</p>
                                        <p className="text-gray-500 text-xs">Safe</p>
                                    </div>
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                                        <p className="text-2xl font-bold text-red-400">{riskyCount}</p>
                                        <p className="text-gray-500 text-xs">Risky</p>
                                    </div>
                                </div>

                                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {gmailMessages.map((m) => {
                                        const style = getVerdictStyle(m.verdict);
                                        return (
                                            <div key={m.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3 hover:bg-white/[0.07] transition">
                                                <div className={`flex-shrink-0 w-10 h-10 rounded-full ${style.bg} flex items-center justify-center mt-0.5`}>
                                                    {m.verdict?.includes("Safe") || m.verdict?.includes("Trusted") ? (
                                                        <HiOutlineCheckCircle className={`w-5 h-5 ${style.color}`} />
                                                    ) : m.verdict?.includes("Risk") || m.verdict?.includes("Suspicious") ? (
                                                        <HiOutlineExclamationCircle className={`w-5 h-5 ${style.color}`} />
                                                    ) : (
                                                        <HiOutlineMail className={`w-5 h-5 ${style.color}`} />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="text-white text-sm font-medium truncate">{m.from}</p>
                                                            <p className="text-gray-500 text-xs truncate">{m.subject || "(no subject)"}</p>
                                                        </div>
                                                        <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold ${style.bg} ${style.color}`}>
                                                            {m.verdict || "Unknown"}
                                                        </span>
                                                    </div>
                                                    {m.phishing_probability != null && (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all ${
                                                                        m.phishing_probability > 0.7 ? "bg-red-500" :
                                                                        m.phishing_probability > 0.4 ? "bg-yellow-500" : "bg-green-500"
                                                                    }`}
                                                                    style={{ width: `${Math.max(5, Math.round(m.phishing_probability * 100))}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-gray-500 text-[10px] w-8 text-right">
                                                                {Math.round(m.phishing_probability * 100)}%
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {showGmailResults && gmailMessages.length === 0 && !gmailLoading && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                                <p className="text-gray-500 text-sm">No emails found in your inbox.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Spam Result Modal */}
            {showModal && result && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setShowModal(false)}>
                    <div className="bg-[#111119] border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            {result === "spam" ? (
                                <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <HiOutlineExclamation className="w-10 h-10 text-red-400" />
                                </div>
                            ) : (
                                <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <HiOutlineCheckCircle className="w-10 h-10 text-green-400" />
                                </div>
                            )}
                            <h3 className="text-2xl font-bold mb-2 text-white">
                                {result === "spam" ? "Spam Detected!" : "Email is Safe"}
                            </h3>
                            <p className="text-gray-400 mb-6">
                                {result === "spam"
                                    ? "This email has been identified as spam. Avoid clicking any links or providing personal information."
                                    : "This email appears to be legitimate. No spam indicators were detected."}
                            </p>
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition"
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

export default EmailScanner;

export const toolInfo = {
    id: "email",
    title: "Email Scanner",
    description: "Scan emails for phishing and scams.",
};