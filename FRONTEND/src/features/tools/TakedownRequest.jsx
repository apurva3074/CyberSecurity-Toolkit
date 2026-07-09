import { useState, useRef } from "react";
import { HiOutlineUpload, HiOutlineX, HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationCircle, HiOutlineArrowRight, HiOutlineArrowLeft } from "react-icons/hi";

import { API_BASE_URL } from "../../config";
import { fetchWithRetry } from "../../lib/fetchWithRetry";
const API_URL = `${API_BASE_URL}/api/takedown`;

const STATUS_CONFIG = {
    pending: { label: "Pending Review", icon: HiOutlineClock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    approved: { label: "Approved", icon: HiOutlineCheckCircle, color: "text-green-400", bg: "bg-green-400/10" },
    rejected: { label: "Rejected", icon: HiOutlineExclamationCircle, color: "text-red-400", bg: "bg-red-400/10" },
    email_sent: { label: "Email Sent to Host", icon: HiOutlineCheckCircle, color: "text-blue-400", bg: "bg-blue-400/10" },
    resolved: { label: "Website Removed", icon: HiOutlineCheckCircle, color: "text-green-400", bg: "bg-green-400/10" },
};

export default function TakedownRequest({ takedownDomain, setTakedownDomain, takedownReason, setTakedownReason, setShowRecentScans }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [screenshot, setScreenshot] = useState(null);
    const [screenshotPreview, setScreenshotPreview] = useState(null);
    const [trackingId, setTrackingId] = useState(null);
    const [requestStatus, setRequestStatus] = useState(null);
    const fileInputRef = useRef(null);

    const handleScreenshotChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setScreenshot(file);
            setScreenshotPreview(URL.createObjectURL(file));
        }
    };

    const removeScreenshot = () => {
        if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
        setScreenshot(null);
        setScreenshotPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async () => {
        setError(null);
        setResult(null);

        if (!takedownDomain?.trim() || !takedownReason?.trim()) {
            setError("Please enter both the malicious URL and a description.");
            return;
        }

        let url = takedownDomain.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
            setTakedownDomain(url);
        }

        setLoading(true);
        setShowRecentScans?.(true);

        try {
            const formData = new FormData();
            formData.append("malicious_url", url);
            formData.append("description", takedownReason.trim());
            if (screenshot) {
                formData.append("screenshot", screenshot);
            }

            const response = await fetchWithRetry(`${API_URL}/request/`, {
                method: "POST",
                body: formData,
            });

            const text = await response.text();
            let data;
            try { data = JSON.parse(text); } catch { data = null; }

            if (!response.ok) {
                const message = data?.error || data?.malicious_url?.[0] || (data ? JSON.stringify(data) : `Request failed: ${response.status}`) || response.statusText;
                setError(message);
            } else if (!data) {
                setError("Server returned an empty response.");
            } else {
                setResult(data);
                setTrackingId(data.id);
                setRequestStatus(data.status);
            }
        } catch (e) {
            setError(`Failed to submit: ${e.message || e}`);
        } finally {
            setLoading(false);
        }
    };

    const checkStatus = async () => {
        if (!trackingId) return;
        try {
            const res = await fetchWithRetry(`${API_URL}/${trackingId}/`);
            const data = await res.json();
            setRequestStatus(data.status);
        } catch {
            // ignore
        }
    };

    if (result) {
        const statusInfo = STATUS_CONFIG[requestStatus] || STATUS_CONFIG.pending;
        const StatusIcon = statusInfo.icon;
        return (
            <div className="space-y-3">
                <h2 className="text-white text-2xl font-semibold">Request Submitted</h2>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Tracking ID:</span>
                        <span className="text-white font-mono font-semibold">#{result.id}</span>
                    </div>

                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${statusInfo.bg}`}>
                        <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                        <span className={`font-semibold text-sm ${statusInfo.color}`}>{statusInfo.label}</span>
                    </div>

                    {result.hosting_provider && (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-xs">Hosting:</span>
                            <span className="text-white text-xs">{result.hosting_provider}</span>
                        </div>
                    )}

                    {result.abuse_email && (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-xs">Abuse Email:</span>
                            <span className="text-purple-300 text-xs">{result.abuse_email}</span>
                        </div>
                    )}
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-green-400 text-xs font-medium">
                        Your request is queued for admin review. Once approved, an abuse report will be sent to the hosting provider.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={checkStatus}
                        className="flex-1 py-3.5 rounded-xl bg-white/10 text-white text-base font-semibold hover:bg-white/20 transition"
                    >
                        Refresh Status
                    </button>
                    <button
                        onClick={() => {
                            setResult(null);
                            setTrackingId(null);
                            setRequestStatus(null);
                            setTakedownDomain("");
                            setTakedownReason("");
                            removeScreenshot();
                            setStep(1);
                        }}
                        className="flex-1 py-3.5 rounded-xl bg-purple-600 text-white text-base font-semibold hover:bg-purple-700 transition"
                    >
                        New Request
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-white text-4xl font-semibold">Takedown Request</h2>
            <p className="text-purple-400 font-semibold text-sm">Report a malicious website for removal</p>

            {/* Step 1: URL */}
            {step === 1 && (
                <div className="space-y-5">
                    <label className="text-gray-300 text-sm font-medium block">Malicious URL <span className="text-red-400">*</span> <span className="text-gray-600 text-xs font-normal">— Step 1 of 3</span></label>
                    <input
                        type="url"
                        placeholder="https://scam-example.com"
                        className="w-full p-4 bg-white/5 border border-white/10 text-white rounded-xl text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50"
                        value={takedownDomain}
                        onChange={(e) => setTakedownDomain(e.target.value)}
                    />
                    <p className="text-gray-600 text-xs">Enter the full URL including https:// of the website you want to report.</p>
                    <button
                        onClick={() => {
                            if (!takedownDomain?.trim()) {
                                setError("Please enter a URL.");
                                return;
                            }
                            setError(null);
                            setStep(2);
                        }}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-base hover:from-purple-700 hover:to-indigo-700 transition flex items-center justify-center gap-2"
                    >
                        Next <HiOutlineArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Step 2: Description */}
            {step === 2 && (
                <div className="space-y-5">
                    <label className="text-gray-300 text-sm font-medium block">Description <span className="text-red-400">*</span> <span className="text-gray-600 text-xs font-normal">— Step 2 of 3</span></label>

                    <textarea
                        placeholder="Describe why this website is malicious — phishing, scam, malware, impersonation, etc."
                        className="w-full p-4 bg-white/5 border border-white/10 text-white rounded-xl text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50"
                        rows={4}
                        value={takedownReason}
                        onChange={(e) => setTakedownReason(e.target.value)}
                    />

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep(1)}
                            className="px-5 py-3.5 rounded-xl bg-white/5 text-gray-400 text-sm font-medium hover:bg-white/10 transition flex items-center gap-1.5"
                        >
                            <HiOutlineArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <button
                            onClick={() => {
                                if (!takedownReason?.trim()) {
                                    setError("Please describe the threat.");
                                    return;
                                }
                                setError(null);
                                setStep(3);
                            }}
                            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-base hover:from-purple-700 hover:to-indigo-700 transition flex items-center justify-center gap-2"
                        >
                            Next <HiOutlineArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Screenshot + Submit */}
            {step === 3 && (
                <div className="space-y-5">
                    <label className="text-gray-300 text-sm font-medium block">Evidence <span className="text-gray-500 text-xs font-normal">(optional)</span> <span className="text-gray-600 text-xs font-normal">— Step 3 of 3</span></label>

                    {screenshotPreview ? (
                        <div className="relative w-full">
                            <img
                                src={screenshotPreview}
                                alt="Screenshot preview"
                                className="w-full max-h-44 object-cover rounded-xl border border-white/10"
                            />
                            <button
                                onClick={removeScreenshot}
                                className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1.5 hover:bg-black transition"
                            >
                                <HiOutlineX className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-6 border-2 border-dashed border-white/20 rounded-xl text-gray-400 hover:border-purple-500 hover:text-purple-400 transition flex flex-col items-center justify-center gap-2"
                        >
                            <HiOutlineUpload className="w-6 h-6" />
                            <span className="text-sm">Click to upload screenshot</span>
                            <span className="text-xs text-gray-600">PNG, JPG up to 5MB</span>
                        </button>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleScreenshotChange}
                    />

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep(2)}
                            className="px-5 py-3.5 rounded-xl bg-white/5 text-gray-400 text-sm font-medium hover:bg-white/10 transition flex items-center gap-1.5"
                        >
                            <HiOutlineArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-base hover:from-purple-700 hover:to-indigo-700 transition ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="spinner" /> Submitting...
                                </span>
                            ) : (
                                "Submit Takedown Request"
                            )}
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
                    {error}
                </div>
            )}
        </div>
    );
}

export const toolInfo = {
    id: "takedown",
    title: "Takedown",
    description: "Request takedown of scam sites.",
};
