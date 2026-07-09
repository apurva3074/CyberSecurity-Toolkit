import { useEffect, useState } from 'react';
import {
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlineTrash,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineUser,
  HiOutlineClock,
  HiOutlineChatAlt2,
  HiOutlineQuestionMarkCircle,
} from 'react-icons/hi';

import { API_BASE_URL } from '../config';
const API_BASE = `${API_BASE_URL}/api/community`;

export default function AdminCommunity() {
  const [questions, setQuestions] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  async function fetchData(pageNumber = page) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/questions/?page=${pageNumber}&is_admin=true`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setQuestions(data);
        setCount(data.length);
        setHasNext(false);
        setHasPrev(pageNumber > 1);
      } else {
        setQuestions(data.results || []);
        setCount(data.count || 0);
        setHasNext(Boolean(data.next));
        setHasPrev(Boolean(data.previous));
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function handleDeleteQuestion(id) {
    if (!window.confirm('Delete this question and all its answers?')) return;
    try {
      const res = await fetch(`${API_BASE}/questions/${id}/?is_admin=true`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      setCount((c) => Math.max(0, c - 1));
    } catch {
      window.alert('Failed to delete question.');
    }
  }

  async function handleDeleteAnswer(questionId, answerId) {
    if (!window.confirm('Delete this answer?')) return;
    try {
      const res = await fetch(`${API_BASE}/answers/${answerId}/?is_admin=true`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, answers: (q.answers || []).filter((a) => a.id !== answerId) }
            : q
        )
      );
    } catch {
      window.alert('Failed to delete answer.');
    }
  }

  const totalAnswers = questions.reduce((sum, q) => sum + (q.answers?.length || 0), 0);
  const filtered = questions.filter((q) => {
    if (!search.trim()) return true;
    const term = search.trim().toLowerCase();
    return (
      (q.title || '').toLowerCase().includes(term) ||
      (q.body || '').toLowerCase().includes(term) ||
      (q.answers || []).some((a) => (a.body || '').toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-gray-400 text-sm">View and moderate community questions &amp; answers</p>
        <button
          onClick={() => fetchData(page)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition text-sm"
        >
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <HiOutlineQuestionMarkCircle className="w-4 h-4 text-white" />
            <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wide">Total Questions</p>
          </div>
          <p className="text-2xl font-bold text-white">{count}</p>
        </div>
        <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <HiOutlineChatAlt2 className="w-4 h-4 text-purple-400" />
            <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wide">Answers (this page)</p>
          </div>
          <p className="text-2xl font-bold text-purple-400">{totalAnswers}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search questions or answers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading questions...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <HiOutlineQuestionMarkCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No questions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => {
            const answerCount = (q.answers || []).length;
            const isExpanded = expandedId === q.id;
            return (
              <div
                key={q.id}
                className={`border rounded-xl overflow-hidden transition ${isExpanded ? 'bg-white/[0.04] border-purple-500/20' : 'bg-white/[0.02] border-white/10'}`}
              >
                <div className="flex items-start gap-3 p-4">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="flex-1 flex items-start gap-3 text-left min-w-0"
                  >
                    {isExpanded ? (
                      <HiOutlineChevronUp className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                    ) : (
                      <HiOutlineChevronDown className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm">{q.title}</p>
                      {q.body && <p className="text-gray-500 text-xs mt-1 line-clamp-1">{q.body}</p>}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <HiOutlineUser className="w-3 h-3" />
                          {q.author_username || 'guest'}
                        </span>
                        <span className="flex items-center gap-1">
                          <HiOutlineClock className="w-3 h-3" />
                          {new Date(q.created_at).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <HiOutlineChatAlt2 className="w-3 h-3" />
                          {answerCount} {answerCount === 1 ? 'answer' : 'answers'}
                        </span>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="flex-shrink-0 p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
                    aria-label="Delete question"
                    title="Delete question"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/5 px-4 pb-4">
                    {answerCount > 0 ? (
                      <div className="space-y-2 pt-4">
                        {q.answers.map((a) => (
                          <div key={a.id} className="flex items-start justify-between gap-2 bg-white/5 rounded-lg p-3">
                            <div className="min-w-0">
                              <p className="text-gray-300 text-sm leading-relaxed">{a.body}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                <span>{a.author_username || 'guest'}</span>
                                <span>{new Date(a.created_at).toLocaleString()}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteAnswer(q.id, a.id)}
                              className="flex-shrink-0 p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
                              aria-label="Delete answer"
                              title="Delete answer"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm pt-4">No answers yet.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination */}
          {(hasPrev || hasNext) && (
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 text-gray-400 text-sm hover:bg-white/10 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={!hasPrev}
                onClick={() => hasPrev && setPage((p) => Math.max(1, p - 1))}
              >
                <HiOutlineChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-gray-500 text-sm">Page {page}</span>
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 text-gray-400 text-sm hover:bg-white/10 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={!hasNext}
                onClick={() => hasNext && setPage((p) => p + 1)}
              >
                Next
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
