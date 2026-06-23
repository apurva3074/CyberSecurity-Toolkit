import { useState, useRef, useEffect } from 'react';
import {
  HiOutlineMail,
  HiOutlineLink,
  HiOutlineExclamation,
} from 'react-icons/hi';

import { API_BASE_URL } from '../config';
const SCAN_STATS_URL = `${API_BASE_URL}/api/scans/stats/`;

export default function Home({ onBrowse }) {
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
        <div className="max-w-7xl mx-auto py-8 md:py-10 lg:py-16 px-6 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

                {/* Left: text */}
                <div className="text-left z-10">
                    <h1 className="font-extrabold mb-4 leading-tight
                        text-[clamp(1.75rem,2.5vw,3.5rem)]
                        md:text-[clamp(1.9rem,2vw,4rem)]
                        lg:text-[clamp(2.25rem,1.8vw,6rem)]"
                    >
                        Protecting your inbox and links from scams
                    </h1>

                    <p className="text-gray-200 mb-6
                        text-[clamp(1rem,1.2vw,1.4rem)]
                        md:text-[clamp(1.05rem,1vw,1.3rem)]"
                    >
                        Our toolkit provides quick, accurate scanning for emails and URLs, automated metadata checks, and easy takedown requests — all in one private, secure dashboard.
                    </p>

                    <button
                        onClick={onBrowse}
                        className="px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-lg bg-[#F7F7F7] text-black font-medium hover:bg-white hover:shadow-lg transition"
                    >
                        Browse our products
                    </button>
                </div>

                {/* Right: video */}
                <div className="w-full flex justify-center lg:justify-end z-10">
                    <div className="w-full max-w-sm md:max-w-md lg:max-w-xl rounded-lg overflow-hidden shadow-lg bg-black">

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

            {/* KPIs — live from backend */}
            <div className="mt-6 md:mt-4 lg:mt-12">
                <h2 className="text-2xl font-semibold mb-4">Key Metrics</h2>

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
        </div>
    );
}