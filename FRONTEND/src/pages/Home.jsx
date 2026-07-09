import { useState, useRef, useEffect } from 'react';
import {
  HiOutlineMail,
  HiOutlineLink,
  HiOutlineExclamation,
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiOutlineLockClosed,
  HiOutlineGlobe,
  HiOutlineChevronDown,
} from 'react-icons/hi';

import { API_BASE_URL } from '../config';
const SCAN_STATS_URL = `${API_BASE_URL}/api/scans/stats/`;

const features = [
    { icon: HiOutlineLightningBolt, label: 'Real-time Scanning', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    { icon: HiOutlineShieldCheck, label: 'AI-Powered Detection', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { icon: HiOutlineLockClosed, label: 'Privacy First', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { icon: HiOutlineGlobe, label: 'Instant Takedowns', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
];

export default function Home({ onBrowse, onSolutions }) {
    const [videoError, setVideoError] = useState(false);
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    const toolkitMp4 = new URL('../assets/toolkit_rectangle.mp4', import.meta.url).href;
    const toolkitWebm = new URL('../assets/toolkit_rectangle.webm', import.meta.url).href;
    const toolkitVideo = new URL('../assets/toolkit_rectangle.mov', import.meta.url).href;
    const posterImage = new URL('../assets/Zentrya.svg', import.meta.url).href;
    const videoRef = useRef(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch(SCAN_STATS_URL);
                const data = await res.json();
                setStats(data);
            } catch {
                setStats(null);
            } finally {
                setStatsLoading(false);
            }
        }
        fetchStats();
    }, []);

    const kpis = [
        {
            icon: HiOutlineMail,
            value: stats ? (stats.email_scans + stats.spam_scans) : 0,
            label: 'Emails Scanned',
            sub: 'Phishing & spam checks',
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
        },
        {
            icon: HiOutlineLink,
            value: stats ? (stats.url_scans + stats.metadata_scans) : 0,
            label: 'URLs Scanned',
            sub: 'Link checks & metadata',
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
        },
        {
            icon: HiOutlineExclamation,
            value: stats?.threats_found || 0,
            label: 'Threats Detected',
            sub: 'Active threats found',
            color: 'text-red-400',
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
        },
    ];

    return (
        <div className="max-w-7xl mx-auto py-8 md:py-10 lg:py-16 px-6 text-white relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

                {/* Left: text */}
                <div className="text-left z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-sm text-purple-300 font-medium">Live Protection Active</span>
                    </div>

                    <h1 className="font-extrabold mb-4 leading-tight
                        text-[clamp(1.75rem,2.5vw,3.5rem)]
                        md:text-[clamp(1.9rem,2vw,4rem)]
                        lg:text-[clamp(2.25rem,1.8vw,6rem)]"
                    >
                        Protecting your inbox{' '}
                        <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                            and links
                        </span>{' '}
                        from scams
                    </h1>

                    <p className="text-gray-400 mb-8 leading-relaxed max-w-lg
                        text-[clamp(1rem,1.2vw,1.4rem)]
                        md:text-[clamp(1.05rem,1vw,1.3rem)]"
                    >
                        Our toolkit provides quick, accurate scanning for emails and URLs, automated metadata checks, and easy takedown requests — all in one private, secure dashboard.
                    </p>

                    <div className="grid grid-cols-2 gap-4 max-w-md mb-8">
                        <button
                            onClick={onBrowse}
                            className="py-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-100 hover:shadow-lg hover:shadow-white/10 transition-all duration-200"
                        >
                            Browse our products
                        </button>
                        <button
                            onClick={onSolutions}
                            className="py-3 rounded-lg border border-white/20 text-white font-medium hover:bg-white/5 hover:border-white/40 transition-all duration-200"
                        >
                            See how it works
                        </button>
                    </div>

                    {/* Feature chips */}
                    <div className="grid grid-cols-2 gap-3 max-w-md">
                        {features.map((f) => {
                            const Icon = f.icon;
                            return (
                                <div
                                    key={f.label}
                                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl ${f.bg} border ${f.border} transition hover:scale-[1.02]`}
                                >
                                    <Icon className={`w-4.5 h-4.5 ${f.color} flex-shrink-0`} />
                                    <span className="text-sm text-gray-300 font-medium">{f.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: video (hidden below 1024px) */}
                <div className="hidden lg:flex w-full justify-center lg:justify-end z-10">
                    <div className="w-full max-w-sm md:max-w-md lg:max-w-xl rounded-2xl overflow-hidden relative">
                        <div className="absolute inset-0 rounded-2xl  pointer-events-none z-10" />

                        {!videoError ? (
                            <video
                                ref={videoRef}
                                poster={posterImage}
                                className="w-40 sm:w-48 md:w-56 lg:w-80 xl:w-96 h-auto object-contain block pointer-events-none mx-auto"
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                tabIndex={-1}
                                onLoadedMetadata={(e) => {
                                    try {
                                        const v = e.currentTarget;
                                        if (v && v.videoWidth === 0 && v.videoHeight === 0) {
                                            setVideoError(true);
                                        }
                                    } catch {
                                        // ignore
                                    }
                                }}
                                onError={() => setVideoError(true)}
                                onPause={(e) => {
                                    try {
                                        const v = videoRef.current || e.currentTarget;
                                        if (v && v.paused) v.play().catch(() => {});
                                    } catch {
                                        // ignore
                                    }
                                }}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                aria-label="Toolkit demo video"
                            >
                                <source src={toolkitMp4} type="video/mp4" />
                                <source src={toolkitWebm} type="video/webm" />
                                <source src={toolkitVideo} type="video/quicktime" />
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <div className="p-6 bg-white/5 text-gray-100 text-center rounded-lg">
                                <p className="mb-3 text-sm">This browser can't play the bundled video.</p>
                                <a
                                    href={toolkitMp4}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                                >
                                    Open video (MP4)
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="mt-10 md:mt-12 lg:mt-16">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-purple-500/30 to-transparent" />
                    <h2 className="text-xl font-semibold text-gray-300 whitespace-nowrap">Platform Metrics</h2>
                    <div className="h-px flex-1 bg-gradient-to-l from-purple-500/30 to-transparent" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {kpis.map((kpi) => {
                        const Icon = kpi.icon;
                        return (
                            <div
                                key={kpi.label}
                                className={`${kpi.bg} border ${kpi.border} rounded-xl p-6 text-center transition hover:scale-[1.02]`}
                            >
                                {statsLoading ? (
                                    <>
                                        <div className="skeleton h-8 w-16 mx-auto mb-2" />
                                        <div className="skeleton h-4 w-24 mx-auto mb-1" />
                                        <div className="skeleton h-3 w-20 mx-auto" />
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <Icon className={`w-5 h-5 ${kpi.color}`} />
                                            <span className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</span>
                                        </div>
                                        <div className="text-sm text-gray-300">{kpi.label}</div>
                                        <div className="text-xs text-gray-500 mt-1">{kpi.sub}</div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="flex justify-center mt-10 lg:mt-14 animate-bounce">
                <button onClick={onBrowse} className="text-gray-500 hover:text-gray-300 transition">
                    <HiOutlineChevronDown className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
