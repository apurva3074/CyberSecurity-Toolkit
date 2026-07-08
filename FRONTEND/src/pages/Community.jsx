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
  HiOutlineCheckCircle,
  HiOutlineQuestionMarkCircle,
} from 'react-icons/hi';

import { API_BASE_URL } from '../config';
import communityImage from '../assets/community.jpg';
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
  const [filter, setFilter] = useState('all');

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
    let filteredList = q
      ? list.filter(
          (it) =>
            (it.title || '').toLowerCase().includes(q) ||
            (it.body || '').toLowerCase().includes(q) ||
            (it.answers || []).some((a) => (a.body || '').toLowerCase().includes(q))
        )
      : list;

    if (filter === 'answered') {
      filteredList = filteredList.filter(it => (it.answers?.length || 0) > 0);
    } else if (filter === 'unanswered') {
      filteredList = filteredList.filter(it => (it.answers?.length || 0) === 0);
    }

    return filteredList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [questions, query, filter]);

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
  const resolvedCount = questions.filter((q) => (q.answers?.length || 0) > 0).length;
  const unansweredCount = questions.length - resolvedCount;

  return (
    <section id="community-section" className="max-w-5xl mx-auto py-16 px-6">
      {/* Header with illustration */}
      <div className="flex flex-col md:flex-row items-center gap-10 mb-10">
        <div className="md:w-1/2 flex justify-center">
          <img src={communityImage} alt="Community" className="w-[16rem] md:w-[20rem] lg:w-[24rem] h-auto object-contain rounded-2xl" />
        </div>
        <div className="md:w-1/2">
          <p className="text-green-400 text-sm font-semibold tracking-wider uppercase mb-2">Community</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-3">Q&A Forum</h2>
          <p className="text-gray-400 text-base max-w-md mb-5">
            Ask questions, share knowledge, and help others stay safe online.
          </p>
          <button
            onClick={() => setShowAsk((s) => !s)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition text-sm"
          >
            {showAsk ? <HiOutlineX className="w-4 h-4" /> : <HiOutlinePlusCircle className="w-4 h-4" />}
            {showAsk ? 'Cancel' : 'Ask a Question'}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{questions.length}</p>
          <p className="text-gray-500 text-xs mt-1">Questions</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{totalAnswers}</p>
          <p className="text-gray-500 text-xs mt-1">Answers</p>
        </div>
        <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{resolvedCount}</p>
          <p className="text-gray-500 text-xs mt-1">Resolved</p>
        </div>
        <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{unansweredCount}</p>
          <p className="text-gray-500 text-xs mt-1">Needs Help</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Ask form */}
      {showAsk && (
        <form onSubmit={handleAsk} className="bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border border-purple-500/20 rounded-2xl p-6 mb-8 space-y-4">
          <h3 className="text-white font-bold text-xl flex items-center gap-2">
            <HiOutlineChatAlt2 className="w-6 h-6 text-purple-400" />
            Ask the Community
          </h3>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What's your question? Be specific."
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50"
            disabled={posting}
          />
          <textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Add more details, context, or what you've already tried (optional)"
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50"
            rows={3}
            disabled={posting}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition disabled:opacity-50"
              disabled={posting || !newTitle.trim()}
            >
              {posting ? 'Posting...' : 'Post Question'}
            </button>
          </div>
        </form>
      )}

      {/* Search + Filter bar */}
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
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All' },
            { id: 'unanswered', label: 'Needs Help' },
            { id: 'answered', label: 'Resolved' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${filter === f.id ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-gray-500">Loading questions...</div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20">
          <HiOutlineQuestionMarkCircle className="w-14 h-14 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-semibold mb-1">No questions found</p>
          <p className="text-gray-600 text-sm">Be the first to ask one — the community is here to help!</p>
        </div>
      )}

      {/* Questions */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((q) => {
            const answerCount = (q.answers || []).length;
            const isExpanded = expandedId === q.id;
            const hasAnswers = answerCount > 0;
            return (
              <article
                key={q.id}
                className={`border rounded-xl overflow-hidden transition ${isExpanded ? 'bg-white/[0.04] border-purple-500/20' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}
              >
                {/* Question header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="w-full flex items-start gap-4 p-5 text-left"
                >
                  {/* Status icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${hasAnswers ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                    {hasAnswers
                      ? <HiOutlineCheckCircle className="w-5 h-5 text-green-400" />
                      : <HiOutlineQuestionMarkCircle className="w-5 h-5 text-yellow-400" />
                    }
                  </div>

                  {/* Question text */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base">{q.title}</h3>
                    {q.body && (
                      <p className="text-gray-500 text-sm mt-1 line-clamp-1">{q.body}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <HiOutlineUser className="w-3 h-3" />
                        {q.author_username || 'guest'}
                      </span>
                      <span className="flex items-center gap-1">
                        <HiOutlineClock className="w-3 h-3" />
                        <TimeAgo date={q.created_at} />
                      </span>
                      <span className="flex items-center gap-1">
                        <HiOutlineChatAlt2 className="w-3 h-3" />
                        {answerCount} {answerCount === 1 ? 'answer' : 'answers'}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Expanded: answers + reply */}
                {isExpanded && (
                  <div className="border-t border-white/5 px-5 pb-5 animate-expandDown">
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

      {/* Bottom info */}
      <div className="mt-12 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">Community Guidelines</h3>
          <p className="text-gray-400 text-sm">Be respectful, stay on topic, and help each other learn. Questions about phishing, malware, and online safety are welcome.</p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <div className="bg-white/5 rounded-xl px-5 py-3 text-center">
            <HiOutlineChatAlt2 className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <p className="text-gray-500 text-[10px]">Ask & Answer</p>
          </div>
          <div className="bg-white/5 rounded-xl px-5 py-3 text-center">
            <HiOutlineCheckCircle className="w-6 h-6 text-purple-400 mx-auto mb-1" />
            <p className="text-gray-500 text-[10px]">Help Others</p>
          </div>
        </div>
      </div>
    </section>
  );
}
