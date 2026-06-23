import { useState, useRef } from "react";
import { HiOutlineUpload, HiOutlineX, HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationCircle } from "react-icons/hi";

import { API_BASE_URL } from "../../config";
const API_URL = `${API_BASE_URL}/api/takedown`;

const STATUS_CONFIG = {
    pending: { label: "Pending Review", icon: HiOutlineClock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    approved: { label: "Approved", icon: HiOutlineCheckCircle, color: "text-green-400", bg: "bg-green-400/10" },
    rejected: { label: "Rejected", icon: HiOutlineExclamationCircle, color: "text-red-400", bg: "bg-red-400/10" },
    email_sent: { label: "Email Sent to Host", icon: HiOutlineCheckCircle, color: "text-blue-400", bg: "bg-blue-400/10" },
    resolved: { label: "Website Removed", icon: HiOutlineCheckCircle, color: "text-green-400", bg: "bg-green-400/10" },
};

export default function TakedownRequest({ takedownDomain, setTakedownDomain, takedownReason, setTakedownReason, setShowRecentScans }) {
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

        setLoading(true);
        setShowRecentScans?.(true);

        try {
            const formData = new FormData();
            formData.append("malicious_url", takedownDomain.trim());
            formData.append("description", takedownReason.trim());
            if (screenshot) {
                formData.append("screenshot", screenshot);
            }

            const response = await fetch(`${API_URL}/request/`, {
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
            const res = await fetch(`${API_URL}/${trackingId}/`);
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
            <div className="space-y-4">
                <h2 className="text-white text-3xl font-semibold">Request Submitted</h2>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Tracking ID:</span>
                        <span className="text-white font-mono font-semibold">#{result.id}</span>
                    </div>

                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${statusInfo.bg}`}>
                        <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                        <span className={`font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
                    </div>

                    {result.hosting_provider && (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm">Hosting Provider:</span>
                            <span className="text-white text-sm">{result.hosting_provider}</span>
                        </div>
                    )}

                    {result.abuse_email && (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm">Abuse Email:</span>
                            <span className="text-purple-300 text-sm">{result.abuse_email}</span>
                        </div>
                    )}
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <p className="text-green-400 text-sm font-medium">
                        Your request is now queued for admin review. Once approved, an abuse report will be sent to the hosting provider.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={checkStatus}
                        className="px-5 py-3 rounded-2xl bg-white/10 text-white font-semibold hover:bg-white/20 transition"
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
                        }}
                        className="px-5 py-3 rounded-2xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
                    >
                        New Request
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-white text-3xl font-semibold">Submit Takedown Request</h2>
            <p className="text-[#6D4E9F] font-semibold text-sm">
                Report a malicious website for removal
            </p>

            {/* Malicious URL */}
            <div>
                <label className="text-gray-400 text-xs font-medium mb-1 block">Malicious URL *</label>
                <input
                    type="url"
                    placeholder="https://scam-example.com"
                    className="w-full p-3 bg-white text-black rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={takedownDomain}
                    onChange={(e) => setTakedownDomain(e.target.value)}
                />
            </div>

            {/* Description */}
            <div>
                <label className="text-gray-400 text-xs font-medium mb-1 block">Description of Malicious Activity *</label>
                <textarea
                    placeholder="Describe why this website is malicious (phishing, scam, malware, etc.)"
                    className="w-full p-3 bg-white text-black rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    value={takedownReason}
                    onChange={(e) => setTakedownReason(e.target.value)}
                />
            </div>

            {/* Screenshot Upload */}
            <div>
                <label className="text-gray-400 text-xs font-medium mb-1 block">Screenshot Evidence (optional)</label>
                {screenshotPreview ? (
                    <div className="relative inline-block">
                        <img
                            src={screenshotPreview}
                            alt="Screenshot preview"
                            className="w-full max-h-40 object-cover rounded-xl border border-white/10"
                        />
                        <button
                            onClick={removeScreenshot}
                            className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 hover:bg-black transition"
                        >
                            <HiOutlineX className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 border-2 border-dashed border-white/20 rounded-2xl text-gray-400 hover:border-purple-500 hover:text-purple-400 transition flex items-center justify-center gap-2"
                    >
                        <HiOutlineUpload className="w-5 h-5" />
                        <span>Click to upload screenshot</span>
                    </button>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleScreenshotChange}
                />
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="spinner" /> Submitting...
                    </span>
                ) : (
                    "Submit Takedown Request"
                )}
            </button>

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