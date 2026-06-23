import { useEffect, useMemo, useState } from 'react';
import {
  HiOutlineSearch,
  HiOutlineChatAlt2,
  HiOutlinePlusCircle,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineReply,
  HiOutlineUser,
  HiOutlineClock,
} from 'react-icons/hi';

import { API_BASE_URL } from '../config';
const API_BASE = `${API_BASE_URL}/api/community`;

function TimeAgo({ date }) {
  if (!date) return null;
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return <span>{diff}s ago</span>;
  if (diff < 3600) return <span>{Math.floor(diff / 60)}m ago</span>;
  if (diff < 86400) return <span>{Math.floor(diff / 3600)}h ago</span>;
  if (diff < 604800) return <span>{Math.floor(diff / 86400)}d ago</span>;
  return <span>{d.toLocaleDateString()}</span>;
}

export default function Community() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const [query, setQuery] = useState('');
  const [showAsk, setShowAsk] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [answerBody, setAnswerBody] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  async function loadPage(pageNumber) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/questions/?page=${pageNumber}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();

      if (Array.isArray(data)) {
        setQuestions(data);
        setHasNext(false);
        setHasPrev(pageNumber > 1);
      } else {
        setQuestions(data.results || []);
        setHasNext(Boolean(data.next));
        setHasPrev(Boolean(data.previous));
      }
    } catch {
      setError('Failed to load questions. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage(page);
  }, [page]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = Array.isArray(questions) ? questions.slice() : [];
    const filteredList = q
      ? list.filter(
          (it) =>
            (it.title || '').toLowerCase().includes(q) ||
            (it.body || '').toLowerCase().includes(q) ||
            (it.answers || []).some((a) => (a.body || '').toLowerCase().includes(q))
        )
      : list;
    return filteredList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [questions, query]);

  async function handleAsk(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setPosting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/questions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), body: newBody.trim() }),
      });
      if (!res.ok) throw new Error('Failed');
      setPage(1);
      loadPage(1);
      setNewTitle('');
      setNewBody('');
      setShowAsk(false);
    } catch {
      setError('Failed to post question.');
    } finally {
      setPosting(false);
    }
  }

  async function handleAnswer(e, questionId) {
    e.preventDefault();
    if (!answerBody.trim()) return;
    setPosting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/answers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: answerBody.trim(), question: questionId }),
      });
      if (!res.ok) throw new Error('Failed');
      const created = await res.json();
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, answers: [...(q.answers || []), created] } : q
        )
      );
      setAnswerBody('');
      setActiveQuestionId(null);
    } catch {
      setError('Failed to post answer.');
    } finally {
      setPosting(false);
    }
  }

  const totalAnswers = questions.reduce((sum, q) => sum + (q.answers?.length || 0), 0);

  return (
    <section id="community-section" className="max-w-4xl mx-auto py-16 px-6">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-white mb-3">Community</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Ask questions, share knowledge, and help others stay safe online.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{questions.length}</p>
          <p className="text-gray-500 text-xs mt-1">Questions</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{totalAnswers}</p>
          <p className="text-gray-500 text-xs mt-1">Answers</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            {questions.filter((q) => (q.answers?.length || 0) > 0).length}
          </p>
          <p className="text-gray-500 text-xs mt-1">Resolved</p>
        </div>
      </div>

      {/* Search + Ask */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions or answers..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50"
          />
        </div>
        <button
          onClick={() => setShowAsk((s) => !s)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition text-sm"
        >
          {showAsk ? <HiOutlineX className="w-4 h-4" /> : <HiOutlinePlusCircle className="w-4 h-4" />}
          {showAsk ? 'Cancel' : 'Ask Question'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Ask form */}
      {showAsk && (
        <form onSubmit={handleAsk} className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 space-y-3">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <HiOutlineChatAlt2 className="w-5 h-5 text-purple-400" />
            Ask a Question
          </h3>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What's your question? Be specific."
            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50"
            disabled={posting}
          />
          <textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Add more details, context, or what you've already tried (optional)"
            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50"
            rows={3}
            disabled={posting}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition disabled:opacity-50"
              disabled={posting || !newTitle.trim()}
            >
              {posting ? 'Posting...' : 'Post Question'}
            </button>
          </div>
        </form>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-gray-500">Loading questions...</div>
      )}

      {/* Questions */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <HiOutlineChatAlt2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No questions found</p>
          <p className="text-gray-600 text-sm">Be the first to ask one!</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-4">
          {filtered.map((q) => {
            const answerCount = (q.answers || []).length;
            const isExpanded = expandedId === q.id;
            return (
              <article
                key={q.id}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition"
              >
                {/* Question header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="w-full flex items-start gap-4 p-5 text-left"
                >
                  {/* Answer count badge */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center ${
                      answerCount > 0
                        ? 'bg-green-500/10 border border-green-500/20'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <span
                      className={`text-lg font-bold ${
                        answerCount > 0 ? 'text-green-400' : 'text-gray-500'
                      }`}
                    >
                      {answerCount}
                    </span>
                    <span className="text-[9px] text-gray-500 -mt-0.5">
                      {answerCount === 1 ? 'ans' : 'ans'}
                    </span>
                  </div>

                  {/* Question text */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base">{q.title}</h3>
                    {q.body && (
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{q.body}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <HiOutlineUser className="w-3 h-3" />
                        {q.author_username || 'guest'}
                      </span>
                      <span className="flex items-center gap-1">
                        <HiOutlineClock className="w-3 h-3" />
                        <TimeAgo date={q.created_at} />
                      </span>
                    </div>
                  </div>
                </button>

                {/* Expanded: answers + reply */}
                {isExpanded && (
                  <div className="border-t border-white/5 px-5 pb-5 animate-expandDown">
                    {/* Answers */}
                    {answerCount > 0 ? (
                      <div className="space-y-3 pt-4">
                        {q.answers.map((a) => (
                          <div key={a.id} className="flex gap-3">
                            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-600/20 flex items-center justify-center mt-0.5">
                              <HiOutlineUser className="w-3.5 h-3.5 text-purple-400" />
                            </div>
                            <div className="flex-1 bg-white/5 rounded-lg p-3">
                              <p className="text-gray-300 text-sm leading-relaxed">{a.body}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                <span>{a.author_username || 'guest'}</span>
                                <span><TimeAgo date={a.created_at} /></span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm pt-4">No answers yet — be the first to help!</p>
                    )}

                    {/* Answer form */}
                    <div className="mt-4">
                      {activeQuestionId === q.id ? (
                        <form onSubmit={(e) => handleAnswer(e, q.id)} className="space-y-3">
                          <textarea
                            value={answerBody}
                            onChange={(e) => setAnswerBody(e.target.value)}
                            placeholder="Write your answer..."
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50"
                            rows={3}
                            disabled={posting}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveQuestionId(null)}
                              className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 text-sm hover:bg-white/10 transition"
                              disabled={posting}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-50"
                              disabled={posting || !answerBody.trim()}
                            >
                              {posting ? 'Posting...' : 'Post Answer'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveQuestionId(q.id);
                            setAnswerBody('');
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 text-sm hover:bg-white/10 hover:text-white transition"
                        >
                          <HiOutlineReply className="w-4 h-4" />
                          Write an answer
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}

          {/* Pagination */}
          {(hasPrev || hasNext) && (
            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
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
    </section>
  );
}