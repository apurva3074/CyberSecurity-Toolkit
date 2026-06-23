import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

import { HiOutlineMail, HiOutlineLink, HiOutlineShieldCheck, HiOutlineExclamationCircle, HiOutlineUser, HiOutlineQuestionMarkCircle, HiOutlineLogout, HiOutlineX } from 'react-icons/hi';
import UrlScanner, { toolInfo as urlInfo } from '../features/tools/UrlScanner';
import EmailScanner, { toolInfo as emailInfo } from '../features/tools/EmailScanner';
import MetadataFetcher, { toolInfo as metadataInfo } from '../features/tools/MetadataFetcher';
import TakedownRequest, { toolInfo as takedownInfo } from '../features/tools/TakedownRequest';
import Home from './Home';
import Products from './Products';
import Solutions from './Solutions';
import Blog from './Blog';
import Glossary from './Glossary';
import Community from './Community';
import Zentrya from '../assets/Zentrya.svg';
import UrlSection from '../sections/UrlSection';

import EmailSection from '../sections/EmailSection';
import MetadataSection from '../sections/MetadataSection';
import TakedownSection from '../sections/TakedownSection';
import Footer from '../components/Footer';

export default function Dashboard() {
    const [selectedTool, setSelectedTool] = useState(null);
    const [currentTab, setCurrentTab] = useState('home');
    const [showProfile, setShowProfile] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    // Fetch user email + handle OAuth redirect params
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUserEmail(session?.user?.email || '');
        });

        const params = new URLSearchParams(window.location.search);
        if (params.get('gmail_connected') === '1') {
            const token = params.get('gmail_token');
            if (token) {
                localStorage.setItem('zentrya_gmail_token', token);
            }
            setCurrentTab('home');
            window.history.replaceState({}, '', window.location.pathname);
            setTimeout(() => {
                const el = document.getElementById('email-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        }
    }, []);

    // Profile menu state & outside-click handler
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Tool definitions (text lives with each component via toolInfo)
    const tools = [
        { ...emailInfo, icon: <HiOutlineMail /> },
        { ...urlInfo, icon: <HiOutlineLink /> },
        { ...metadataInfo, icon: <HiOutlineShieldCheck /> },
        { ...takedownInfo, icon: <HiOutlineExclamationCircle /> },
    ];

    const toolsMap = Object.fromEntries(tools.map(t => [t.id, t]));

    // Form state for each tool
    const [urlInput, setUrlInput] = useState('');
    const [emailFile, setEmailFile] = useState(null);
    const [typoDomain, setTypoDomain] = useState('');
    const [takedownDomain, setTakedownDomain] = useState('');
    const [takedownReason, setTakedownReason] = useState('');

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen w-full " style={{ background: '#000', position: 'relative' }}>
            <div
                style={{
                    position: 'absolute',
                    left: '-20%',
                    top: '-20%',
                    width: '55vw',
                    height: '55vw',
                    minWidth: '500px',
                    minHeight: '500px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(155,89,182,0.32) 0%, rgba(68,39,80,0.18) 55%, rgba(0,0,0,0) 100%)',
                    filter: 'blur(12px)',
                    zIndex: 0,
                }}
            />
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-[9999] shadow flex flex-col sm:flex-row items-center justify-between sm:px-6 md:px-8 bg-black/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 sm:mb-0">
                    <img src={Zentrya} alt="Logo" className="h-20 w-20 cursor-pointer" onClick={() => setCurrentTab('home')} />
                </div>
                <nav className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                    <button
                        onClick={() => { setCurrentTab('home'); setSelectedTool(null); scrollToSection('home-section'); }}
                        aria-current={currentTab === 'home' ? 'page' : undefined}
                        className={`font-medium hover:underline hover:text-[#8AC0FF] text-sm sm:text-base transition-colors ${currentTab === 'home' ? 'text-[#8AC0FF]' : 'text-[#FFFFFF]'}`}
                    >
                        Home
                    </button>

                    <button
                        onClick={() => { setCurrentTab('solutions'); scrollToSection('solutions-section'); }}
                        aria-current={currentTab === 'solutions' ? 'page' : undefined}
                        className={`font-medium hover:underline hover:text-[#8AC0FF] text-sm sm:text-base transition-colors ${currentTab === 'solutions' ? 'text-[#8AC0FF]' : 'text-[#FFFFFF]'}`}
                    >
                        Solutions
                    </button>
                    <button
                        onClick={() => { setCurrentTab('blog'); scrollToSection('blog-section'); }}
                        aria-current={currentTab === 'blog' ? 'page' : undefined}
                        className={`font-medium hover:underline hover:text-[#8AC0FF] text-sm sm:text-base transition-colors ${currentTab === 'blog' ? 'text-[#8AC0FF]' : 'text-[#FFFFFF]'}`}
                    >
                        Blog
                    </button>
                    <button
                        onClick={() => { setCurrentTab('glossary'); scrollToSection('glossary-section'); }}
                        aria-current={currentTab === 'glossary' ? 'page' : undefined}
                        className={`font-medium hover:underline hover:text-[#8AC0FF] text-sm sm:text-base transition-colors ${currentTab === 'glossary' ? 'text-[#8AC0FF]' : 'text-[#FFFFFF]'}`}
                    >
                        Glossary
                    </button>
                    <button
                        onClick={() => { setCurrentTab('community'); scrollToSection('community-section'); }}
                        aria-current={currentTab === 'community' ? 'page' : undefined}
                        className={`font-medium hover:underline hover:text-[#8AC0FF] text-sm sm:text-base transition-colors ${currentTab === 'community' ? 'text-[#8AC0FF]' : 'text-[#FFFFFF]'}`}
                    >
                        Community
                    </button>
                </nav>
                <div className="flex gap-2 mt-4 sm:mt-0 items-center" ref={profileRef}>
                    {/* Profile avatar button */}
                    <button
                        className="flex items-center gap-2 px-3 py-1 rounded-full bg-transparent border border-transparent hover:bg-white/5"
                        onClick={() => setProfileOpen(p => !p)}
                        aria-haspopup="true"
                        aria-expanded={profileOpen}
                    >
                        <div className="h-9 w-9 rounded-full bg-purple-600 flex items-center justify-center text-white">
                            <HiOutlineUser />
                        </div>
                    </button>

                    {/* Dropdown menu */}
                    {profileOpen && (
                        <div className="absolute right-6 top-20 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl w-48 text-sm z-[9999] overflow-hidden">
                            <div className="px-4 py-3 border-b border-white/10">
                                <p className="text-white text-sm font-medium truncate">{userEmail || 'User'}</p>
                                <p className="text-gray-500 text-xs mt-0.5">Zentrya Account</p>
                            </div>
                            <ul className="flex flex-col py-1">
                                <li>
                                    <button
                                        className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-gray-200 flex items-center gap-2 transition"
                                        onClick={() => { setProfileOpen(false); setShowProfile(true); }}
                                    >
                                        <HiOutlineUser className="w-4 h-4" />
                                        <span>Profile</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-gray-200 flex items-center gap-2 transition"
                                        onClick={() => { setProfileOpen(false); setCurrentTab('solutions'); scrollToSection('solutions-section'); }}
                                    >
                                        <HiOutlineQuestionMarkCircle className="w-4 h-4" />
                                        <span>Help & Guides</span>
                                    </button>
                                </li>
                                <li className="border-t border-white/10">
                                    <button
                                        className="w-full text-left px-4 py-2.5 hover:bg-red-500/10 text-red-400 flex items-center gap-2 transition"
                                        onClick={async () => { setProfileOpen(false); await handleLogout(); }}
                                    >
                                        <HiOutlineLogout className="w-4 h-4" />
                                        <span>Logout</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </header>

            {/* Profile Modal */}
            {showProfile && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center animate-fadeIn">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowProfile(false)} />
                    <div className="relative bg-[#111119] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 z-10 animate-slideUp">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Your Profile</h3>
                            <button
                                onClick={() => setShowProfile(false)}
                                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
                            >
                                <HiOutlineX className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-16 w-16 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                {userEmail ? userEmail[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                                <p className="text-white font-semibold text-lg">{userEmail || 'User'}</p>
                                <p className="text-gray-500 text-sm">Zentrya User Account</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-gray-500 text-xs font-medium mb-1">Email Address</p>
                                <p className="text-white text-sm">{userEmail}</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-gray-500 text-xs font-medium mb-1">Role</p>
                                <p className="text-white text-sm">User</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-gray-500 text-xs font-medium mb-1">Platform</p>
                                <p className="text-white text-sm">Zentrya Cybersecurity Toolkit</p>
                            </div>
                        </div>

                        <button
                            onClick={async () => { setShowProfile(false); await handleLogout(); }}
                            className="w-full mt-6 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold hover:bg-red-500/20 transition text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="pt-28">
                {/* Home tab: only stack the four product sections, each full-screen */}
                {currentTab === 'home' ? (
                    <div>

                        <section id="home-section" className="min-h-screen flex items-center justify-center">
                            <Home onBrowse={() => scrollToSection('url-section')} />
                        </section>

                        <section id="url-section" className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
                            <UrlSection urlInput={urlInput} setUrlInput={setUrlInput} />
                        </section>

                        <section id="email-section" className="min-h-screen flex items-center justify-center bg-[#020106]">
                            <EmailSection setEmailFile={setEmailFile} />
                        </section>

                        <section id="metadata-section" className="min-h-screen flex items-center justify-center bg-[#e9e9f7]">
                            <MetadataSection typoDomain={typoDomain} setTypoDomain={setTypoDomain} />
                        </section>

                        <section id="takedown-section" className="min-h-screen flex items-center justify-center bg-[#020106]">
                            <TakedownSection
                                takedownDomain={takedownDomain}
                                setTakedownDomain={setTakedownDomain}
                                takedownReason={takedownReason}
                                setTakedownReason={setTakedownReason}
                            />
                        </section>
                    </div>
                ) : currentTab === 'products' ? (
                    <Products
                        tools={tools}
                        onSelect={(id) => setSelectedTool(id)}
                        selectedTool={selectedTool}
                        onBack={() => setSelectedTool(null)}
                        urlInput={urlInput}
                        setUrlInput={setUrlInput}
                        emailFile={emailFile}
                        setEmailFile={setEmailFile}
                        typoDomain={typoDomain}
                        setTypoDomain={setTypoDomain}
                        takedownDomain={takedownDomain}
                        setTakedownDomain={setTakedownDomain}
                        takedownReason={takedownReason}
                        setTakedownReason={setTakedownReason}
                    />
                ) : currentTab === 'solutions' ? (
                    <Solutions />
                ) : currentTab === 'blog' ? (
                    <Blog />
                ) : currentTab === 'glossary' ? (
                    <Glossary />
                ) : currentTab === 'community' ? (
                    <Community />
                ) : null}
            </main>
            <Footer onNavigate={setCurrentTab} />
        </div>
    );
}