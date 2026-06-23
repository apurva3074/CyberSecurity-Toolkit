import { useState, useEffect } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineMail,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineRefresh,
  HiOutlineArrowLeft,
  HiOutlineExclamationCircle,
  HiOutlinePhotograph,
  HiOutlineBadgeCheck,
} from "react-icons/hi";
import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/api/takedown`;

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-500/20 text-yellow-400", icon: HiOutlineClock },
  approved: { label: "Approved", color: "bg-green-500/20 text-green-400", icon: HiOutlineCheckCircle },
  rejected: { label: "Rejected", color: "bg-red-500/20 text-red-400", icon: HiOutlineXCircle },
  email_sent: { label: "Email Sent", color: "bg-blue-500/20 text-blue-400", icon: HiOutlineMail },
  resolved: { label: "Resolved", color: "bg-emerald-500/20 text-emerald-400", icon: HiOutlineBadgeCheck },
};

const STATUS_FLOW = ["pending", "approved", "email_sent", "resolved"];

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

function StatusTimeline({ currentStatus }) {
  const isRejected = currentStatus === "rejected";
  const steps = isRejected
    ? [{ key: "pending", label: "Submitted" }, { key: "rejected", label: "Rejected" }]
    : STATUS_FLOW.map((key) => ({ key, label: STATUS_CONFIG[key].label }));

  const currentIdx = steps.findIndex((s) => s.key === currentStatus);

  return (
    <div className="flex items-center gap-1 w-full">
      {steps.map((step, i) => {
        const done = i <= currentIdx;
        const config = STATUS_CONFIG[step.key];
        const Icon = config.icon;
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  done ? config.color : "bg-white/5 text-gray-600"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] mt-1 font-medium ${done ? "text-gray-300" : "text-gray-600"}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mt-[-14px] ${i < currentIdx ? "bg-purple-500/50" : "bg-white/5"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function RequestDetail({ request, onBack, onRefresh }) {
  const [adminNotes, setAdminNotes] = useState(request.admin_notes || "");
  const [actionLoading, setActionLoading] = useState(null);
  const [emailBody, setEmailBody] = useState(request.email_body || "");
  const [message, setMessage] = useState(null);

  const handleAction = async (action) => {
    setActionLoading(action);
    setMessage(null);
    try {
      const body = {};
      if (action === "approve" || action === "reject") body.admin_notes = adminNotes;
      if (action === "send-email") body.email_body = emailBody;

      const res = await fetch(`${API_URL}/${request.id}/${action}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Action failed" });
      } else {
        setMessage({ type: "success", text: data.message });
        if (data.email_body) setEmailBody(data.email_body);
        onRefresh();
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (e) {
      setMessage({ type: "error", text: String(e) });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm">
        <HiOutlineArrowLeft className="w-4 h-4" /> Back to all requests
      </button>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Request #{request.id}</h2>
          <p className="text-gray-400 text-sm mt-1">Submitted {new Date(request.created_at).toLocaleString()}</p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Status Timeline */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Progress</h3>
        <StatusTimeline currentStatus={request.status} />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column — Info */}
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
            <h3 className="text-white font-semibold text-lg">Request Details</h3>
            <div>
              <span className="text-gray-500 text-xs font-medium">Malicious URL</span>
              <p className="text-purple-300 text-sm break-all mt-0.5">{request.malicious_url}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs font-medium">Description</span>
              <p className="text-gray-300 text-sm mt-0.5 whitespace-pre-line">{request.description}</p>
            </div>
            {request.screenshot && (
              <div>
                <span className="text-gray-500 text-xs font-medium flex items-center gap-1">
                  <HiOutlinePhotograph className="w-3.5 h-3.5" /> Screenshot Evidence
                </span>
                <img
                  src={`${API_BASE_URL}${request.screenshot}`}
                  alt="Evidence"
                  className="mt-2 rounded-lg border border-white/10 max-h-64 object-contain cursor-pointer hover:opacity-80 transition"
                  onClick={() => window.open(`${API_BASE_URL}${request.screenshot}`, "_blank")}
                />
              </div>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold text-lg">Hosting Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500 text-xs font-medium">Provider</span>
                <p className="text-gray-300 text-sm mt-0.5">{request.hosting_provider || "Unknown"}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs font-medium">Abuse Email</span>
                <p className="text-purple-300 text-sm mt-0.5">{request.abuse_email || "Not found"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Actions */}
        <div className="space-y-4">
          {/* Admin Notes */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold text-lg">Admin Notes</h3>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about this request..."
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50"
              rows={3}
            />

            {/* Pending: Approve / Reject */}
            {request.status === "pending" && (
              <div className="flex gap-3">
                <button
                  onClick={() => { if (window.confirm("Approve this takedown request?")) handleAction("approve"); }}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition disabled:opacity-50"
                >
                  <HiOutlineCheckCircle className="w-5 h-5" />
                  {actionLoading === "approve" ? "Approving..." : "Approve"}
                </button>
                <button
                  onClick={() => { if (window.confirm("Reject this takedown request?")) handleAction("reject"); }}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition disabled:opacity-50"
                >
                  <HiOutlineXCircle className="w-5 h-5" />
                  {actionLoading === "reject" ? "Rejecting..." : "Reject"}
                </button>
              </div>
            )}
          </div>

          {/* Email Section — after approval */}
          {(request.status === "approved" || request.status === "email_sent" || request.status === "resolved") && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <HiOutlineMail className="w-5 h-5" /> Abuse Email
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">To:</span>
                <span className="text-purple-300">{request.abuse_email || "No email found"}</span>
              </div>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                disabled={request.status !== "approved"}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-gray-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 disabled:opacity-60"
                rows={10}
              />

              {request.status === "approved" && (
                <button
                  onClick={() => handleAction("send-email")}
                  disabled={actionLoading || !request.abuse_email}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-50"
                >
                  <HiOutlineMail className="w-5 h-5" />
                  {actionLoading === "send-email" ? "Sending..." : "Send Email to Hosting Provider"}
                </button>
              )}

              {request.status === "email_sent" && (
                <>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-blue-400 text-sm">
                    Email sent to {request.abuse_email}
                  </div>
                  <button
                    onClick={() => handleAction("resolve")}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition disabled:opacity-50"
                  >
                    <HiOutlineBadgeCheck className="w-5 h-5" />
                    {actionLoading === "resolve" ? "Resolving..." : "Mark as Resolved"}
                  </button>
                </>
              )}

              {request.status === "resolved" && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-emerald-400 text-sm font-semibold">
                  This request has been resolved. The malicious website has been reported and taken down.
                </div>
              )}
            </div>
          )}

          {/* Rejected info */}
          {request.status === "rejected" && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
              <p className="text-red-400 text-sm font-semibold">This request was rejected.</p>
              {request.admin_notes && (
                <p className="text-gray-400 text-sm mt-2">Reason: {request.admin_notes}</p>
              )}
            </div>
          )}

          {/* Feedback message */}
          {message && (
            <div
              className={`rounded-lg p-3 text-sm ${
                message.type === "success"
                  ? "bg-green-500/10 border border-green-500/20 text-green-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/list/`);
      const data = await res.json();
      setRequests(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}/`);
      const data = await res.json();
      setSelectedRequest(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (selectedId) fetchDetail(selectedId);
  }, [selectedId]);

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const counts = {};
  for (const r of requests) counts[r.status] = (counts[r.status] || 0) + 1;

  if (selectedId && selectedRequest) {
    return (
      <RequestDetail
        request={selectedRequest}
        onBack={() => { setSelectedId(null); setSelectedRequest(null); fetchRequests(); }}
        onRefresh={() => fetchDetail(selectedId)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-gray-400 text-sm">Manage and review takedown requests</p>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition text-sm"
        >
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs with counts */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "approved", label: "Approved" },
          { key: "email_sent", label: "Email Sent" },
          { key: "resolved", label: "Resolved" },
          { key: "rejected", label: "Rejected" },
        ].map((tab) => {
          const count = tab.key === "all" ? requests.length : counts[tab.key] || 0;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-1.5 ${
                filter === tab.key
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === tab.key ? "bg-white/20" : "bg-white/10"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading requests...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <HiOutlineExclamationCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No {filter === "all" ? "" : filter} requests found</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium">ID</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium">Malicious URL</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium">Status</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium">Date</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr
                  key={req.id}
                  className="border-b border-white/5 hover:bg-white/5 transition cursor-pointer"
                  onClick={() => setSelectedId(req.id)}
                >
                  <td className="px-5 py-3.5 text-white font-mono text-sm">#{req.id}</td>
                  <td className="px-5 py-3.5 text-purple-300 text-sm max-w-xs truncate">{req.malicious_url}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={req.status} /></td>
                  <td className="px-5 py-3.5 text-gray-400 text-sm">{new Date(req.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition">
                      <HiOutlineEye className="w-4 h-4" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
