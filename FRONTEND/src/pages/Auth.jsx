import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Logo from '../assets/Logo.svg';

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [mobileIntroDone, setMobileIntroDone] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMobileIntroDone(true), 2500);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setError(error.message);
            
        } else {
            const { data: signUpData, error } = await supabase.auth.signUp({ email, password });
            if (error) {
                setError(error.message);
            } else {
                if (signUpData?.user) {
                    await supabase.from('profiles').upsert({
                        id: signUpData.user.id,
                        email: signUpData.user.email,
                        role: 'user',
                    });
                }
                
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8" style={{ background: '#000', position: 'relative', overflow: 'hidden' }}>
            {/* Large, extra-soft, circular radial gradient top-left */}
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
            {/* Smaller, extra-soft, circular radial gradient bottom-right */}
            <div
                style={{
                    position: 'absolute',
                    right: '-12%',
                    bottom: '-12%',
                    width: '26vw',
                    height: '26vw',
                    minWidth: '220px',
                    minHeight: '220px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(155,89,182,0.22) 0%, rgba(68,39,80,0.13) 55%, rgba(0,0,0,0) 100%)',
                    filter: 'blur(6px)',
                    zIndex: 0,
                }}
            />
            {/* Mobile intro loader: shown briefly before the login/signup form appears */}
            {!mobileIntroDone && (
                <div className="md:hidden fixed inset-0 z-20 flex flex-col items-center justify-center px-8 text-center" style={{ background: '#000' }}>
                    <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '2.2rem', fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>
                        <span style={{ display: 'block' }}>One</span>
                        <span style={{ display: 'block' }}>Platform</span>
                        <span style={{ display: 'block' }}>
                            <span style={{ color: '#8AC0FF' }}>Total</span> Protection
                        </span>
                    </h1>
                    <p style={{ color: '#fff', fontSize: '1rem', marginTop: '1rem', maxWidth: 320, opacity: 0.85, fontFamily: 'Poppins, sans-serif' }}>
                        Security That Works—-So You Don’t Have to Worry.
                    </p>
                    <div className="w-10 h-10 border-[3px] border-white/20 border-t-white rounded-full animate-spin mt-8" />
                </div>
            )}

            {/* Main content: left text and right form */}
            <div className={`w-full max-w-5xl items-center justify-center relative z-10 ${mobileIntroDone ? 'flex' : 'hidden md:flex'}`}>
                {/* Left text */}
                <div className="flex-1 hidden md:flex flex-col items-start pr-8">
                    <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '2.8rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
                        <span style={{ display: 'block' }}>One</span>
                        <span style={{ display: 'block' }}>Platform</span>
                        <span style={{ display: 'block' }}>
                            <span style={{ color: '#8AC0FF' }}>Total</span> Protection
                        </span>
                    </h1>
                    <p style={{ color: '#fff', fontSize: '1.2rem', marginTop: '1.2rem', maxWidth: 400, opacity: 0.85, fontFamily: 'Poppins, sans-serif' }}>
                        Security That Works—-So You Don’t Have to Worry.
                    </p>
                </div>
                {/* Right form */}
                <div className="bg-white rounded-2xl shadow-lg w-full max-w-xs sm:max-w-md ml-0 md:ml-12 p-6 sm:p-8 border-2" style={{ borderColor: '#52154E', zIndex: 1, position: 'relative' }}>
                    {/* Tab Switcher */}
                    <div className="relative flex h-12">
                        <img
                            src={Logo}
                            alt="Logo"
                            className="h-15 w-15 absolute left-0 top-1/2 transform -translate-y-1/2"
                        />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-semibold text-left mb-4 sm:mb-6" style={{ color: '#292929' }}>
                        {isLogin ? 'Login to Zentrya' : 'Sign Up for Zentrya'}
                    </h2>

                    {error && (
                        <div className="p-3 rounded mb-4 text-center text-sm sm:text-base" style={{ background: '#F9CFF2', color: '#52154E' }}>
                            {error}
                        </div>
                    )}

                    <div className="overflow-hidden">
                        <div
                            className="flex transition-transform duration-500"
                            style={{ transform: isLogin ? 'translateX(0%)' : 'translateX(-50%)', width: '200%' }}
                        >
                            {/* Login Form */}
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4 flex flex-col items-start w-1/2"
                                style={{ minWidth: 0 }}
                            >
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8AC0FF] text-sm sm:text-base"
                                    style={{ borderColor: '#8AC0FF', color: '#000000', background: '#fff', boxShadow: 'none' }}
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8AC0FF] text-sm sm:text-base"
                                    style={{ borderColor: '#8AC0FF', color: '#000000', background: '#fff', boxShadow: 'none' }}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-3xl font-semibold border transition text-sm sm:text-base"
                                    style={{ background: '#111344', color: '#fff', borderColor: '#442750' }}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Login'}
                                </button>
                            </form>
                            {/* Sign Up Form */}
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4 flex flex-col items-start w-1/2"
                                style={{ minWidth: 0 }}
                            >
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8AC0FF] text-sm sm:text-base"
                                    style={{ borderColor: '#8AC0FF', color: '#000', background: '#fff', boxShadow: 'none' }}
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8AC0FF] text-sm sm:text-base"
                                    style={{ borderColor: '#8AC0FF', color: '#000', background: '#fff', boxShadow: 'none' }}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-3xl font-semibold border transition text-sm sm:text-base"
                                    style={{ background: '#111344', color: '#fff', borderColor: '#442750' }}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Sign Up'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="mt-4 sm:mt-6 text-center" style={{ color: '#52154E' }}>
                        <button
                            type="button"
                            className="hover:underline font-medium text-sm sm:text-base"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin
                                ? "Don't have an account? Sign Up"
                                : 'Already have an account? Login'}
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
}