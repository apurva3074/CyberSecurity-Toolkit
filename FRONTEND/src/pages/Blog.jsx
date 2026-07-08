import { useMemo, useState, useEffect } from 'react';
import { HiOutlineRefresh, HiOutlineX, HiOutlineArrowRight, HiOutlineClock, HiOutlineUser } from 'react-icons/hi';

const SAMPLE_POSTS = [
    {
        id: 1,
        title: 'How to spot a phishing email in 30 seconds',
        excerpt: 'Quick heuristics and red flags you can use immediately to identify suspicious emails before clicking any link.',
        content: `Phishing emails often impersonate trusted services and ask for immediate action. Look for mismatched sender addresses, generic greetings, urgent language, and links that don't match their displayed text. Use hover-preview for links and validate attachments on a sandbox. When in doubt, go directly to the service site instead of clicking links.`,
        author: 'A. Researcher',
        date: '2025-10-01',
        tags: ['email', 'phishing', 'security'],
        readTime: '3 min read',
    },
    {
        id: 2,
        title: 'Why URLs lie — decoding shortened links safely',
        excerpt: 'Short links are convenient, but they hide destination metadata. Learn safe ways to preview and resolve links.',
        content: `Shortened URLs are opaque. Use preview tools or a resolver service to expand short links before visiting. Check TLS certificates and domain age for suspicious destinations. If an email asks you to sign in via a short link, ignore and go to the site directly.`,
        author: 'V. Analyst',
        date: '2025-09-18',
        tags: ['links', 'privacy'],
        readTime: '4 min read',
    },
    {
        id: 3,
        title: 'Automating takedown requests: best practices',
        excerpt: 'From evidence collection to legal templates — streamline takedown workflows while keeping audit trails.',
        content: `Collect screenshots, timestamps, and source URLs. Use standardized templates and send via the platform's preferred channels. Maintain an internal log for follow-ups and escalations. Automate retries and tracking to reduce manual overhead.`,
        author: 'Legal Team',
        date: '2025-08-07',
        tags: ['takedown', 'automation'],
        readTime: '5 min read',
    },
    {
        id: 4,
        title: 'Metadata checks that catch fraud',
        excerpt: 'Simple metadata checks that often reveal cloned sites, fake emails, and scraped content.',
        content: `Compare title tags, canonical links, and hosting IP ranges. Look for mismatches between visible content and meta descriptions. Check for copied images with different source URLs — small inconsistencies often reveal scraping or clones.`,
        author: 'S. Ops',
        date: '2025-07-22',
        tags: ['metadata', 'detection'],
        readTime: '3 min read',
    },
    {
        id: 5,
        title: 'Designing a privacy-first scanner',
        excerpt: 'Principles and trade-offs when building scanning tools that minimize data exposure.',
        content: `Minimize data retention, centralize sensitive processing, and offer opt-in telemetry. Design interfaces that explain what is shared and why. Favor client-side redaction where possible and provide audit logs for transparency.`,
        author: 'Product',
        date: '2025-06-30',
        tags: ['privacy', 'design'],
        readTime: '4 min read',
    },
    {
        id: 6,
        title: 'Case study: removing a scam network',
        excerpt: 'A quick summary of a takedown we coordinated and the measurable results over two weeks.',
        content: `We identified a network of domains and coordinated with hosts, registrars, and payment providers to remove listings. Within two weeks, fraudulent listings dropped by 87% and user reports fell significantly.`,
        author: 'Case Studies',
        date: '2025-05-12',
        tags: ['case study', 'results'],
        readTime: '6 min read',
    }
];

const ALL_TAGS = [...new Set(SAMPLE_POSTS.flatMap(p => p.tags))];

function shuffle(array) {
    const a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function Blog() {
    const [seed, setSeed] = useState(0);
    const [openPost, setOpenPost] = useState(null);
    const [activeTag, setActiveTag] = useState('all');

    const shuffled = useMemo(() => shuffle(SAMPLE_POSTS), [seed]);

    const filtered = activeTag === 'all'
        ? shuffled
        : shuffled.filter(p => p.tags.includes(activeTag));

    const featured = filtered[0];
    const rest = filtered.slice(1);

    useEffect(() => {
        function onKey(e) {
            if (e.key === 'Escape') setOpenPost(null);
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    return (
        <section id="blog-section" className="max-w-5xl mx-auto py-16 px-6">
            {/* Header — left aligned */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
                <div>
                    <p className="text-purple-400 text-sm font-semibold tracking-wider uppercase mb-2">Blog</p>
                    <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">Cybersecurity<br />Insights</h2>
                </div>
                <button
                    onClick={() => setSeed((s) => s + 1)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition text-sm font-medium self-start md:self-auto"
                >
                    <HiOutlineRefresh className="w-4 h-4" />
                    Shuffle
                </button>
            </div>

            {/* Tag filter bar */}
            <div className="flex gap-2 overflow-x-auto flex-nowrap no-scrollbar md:flex-wrap md:overflow-visible mb-10 -mx-6 px-6 md:mx-0 md:px-0">
                <button
                    onClick={() => setActiveTag('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition flex-shrink-0 ${activeTag === 'all' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                >
                    All
                </button>
                {ALL_TAGS.map(tag => (
                    <button
                        key={tag}
                        onClick={() => setActiveTag(tag)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition capitalize flex-shrink-0 ${activeTag === tag ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500 text-lg">No posts match this tag.</p>
                </div>
            ) : (
                <>
                    {/* Featured hero post */}
                    {featured && (
                        <div
                            className="bg-gradient-to-br from-purple-500/10 via-white/5 to-indigo-500/10 border border-purple-500/20 rounded-2xl p-8 md:p-10 mb-8 cursor-pointer group hover:border-purple-500/40 transition-all"
                            onClick={() => setOpenPost(featured)}
                        >
                            <div className="flex gap-2 mb-4">
                                {featured.tags.map((t) => (
                                    <span key={t} className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-semibold capitalize">
                                        {t}
                                    </span>
                                ))}
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-purple-300 transition leading-tight">
                                {featured.title}
                            </h3>
                            <p className="text-gray-400 text-base mb-6 max-w-2xl leading-relaxed">{featured.excerpt}</p>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                    <span className="flex items-center gap-1.5">
                                        <HiOutlineUser className="w-4 h-4" />
                                        {featured.author}
                                    </span>
                                    <span>{featured.date}</span>
                                    <span className="flex items-center gap-1.5">
                                        <HiOutlineClock className="w-4 h-4" />
                                        {featured.readTime}
                                    </span>
                                </div>
                                <span className="text-purple-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                    Read <HiOutlineArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Remaining posts — horizontal list cards */}
                    {rest.length > 0 && (
                        <div className="space-y-4">
                            {rest.map((p) => (
                                <article
                                    key={p.id}
                                    className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4 hover:border-white/20 transition group cursor-pointer"
                                    onClick={() => setOpenPost(p)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex gap-2 mb-2">
                                            {p.tags.slice(0, 2).map((t) => (
                                                <span key={t} className="bg-purple-500/20 text-purple-400 px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                        <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-purple-300 transition">{p.title}</h3>
                                        <p className="text-gray-500 text-sm line-clamp-1">{p.excerpt}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-shrink-0 md:flex-col md:items-end md:gap-1">
                                        <span className="flex items-center gap-1"><HiOutlineUser className="w-3.5 h-3.5" />{p.author}</span>
                                        <span className="flex items-center gap-1"><HiOutlineClock className="w-3.5 h-3.5" />{p.readTime}</span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Modal */}
            {openPost && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
                    role="dialog"
                    aria-modal="true"
                    aria-label={openPost.title}
                >
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={() => setOpenPost(null)} />
                    <div className="relative max-w-2xl w-full mx-4 bg-[#111119] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 z-10 animate-slideUp max-h-[80vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex gap-2 mb-3">
                                    {openPost.tags.map((t) => (
                                        <span key={t} className="bg-purple-500/20 text-purple-400 px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                                <h3 className="text-2xl font-bold text-white">{openPost.title}</h3>
                                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                    <span>{openPost.author}</span>
                                    <span>·</span>
                                    <span>{openPost.date}</span>
                                    <span>·</span>
                                    <span>{openPost.readTime}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setOpenPost(null)}
                                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition flex-shrink-0"
                                aria-label="Close"
                            >
                                <HiOutlineX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="text-gray-300 leading-relaxed text-base">
                            {openPost.content}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
