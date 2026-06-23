import {
  HiOutlineShieldCheck,
  HiOutlineMail,
  HiOutlineLink,
  HiOutlineExclamationCircle,
  HiOutlineGlobe,
} from 'react-icons/hi';
import Zentrya from '../assets/Zentrya.svg';

export default function Footer({ onNavigate }) {
  const currentYear = new Date().getFullYear();

  const toolLinks = [
    { label: 'URL Scanner', icon: HiOutlineLink, section: 'url-section' },
    { label: 'Email Scanner', icon: HiOutlineMail, section: 'email-section' },
    { label: 'Metadata Fetcher', icon: HiOutlineShieldCheck, section: 'metadata-section' },
    { label: 'Takedown Request', icon: HiOutlineExclamationCircle, section: 'takedown-section' },
  ];

  const pageLinks = [
    { label: 'Home', tab: 'home' },
    { label: 'Solutions', tab: 'solutions' },
    { label: 'Blog', tab: 'blog' },
    { label: 'Glossary', tab: 'glossary' },
    { label: 'Community', tab: 'community' },
  ];

  const handleScroll = (sectionId) => {
    if (onNavigate) {
      onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleNav = (tab) => {
    if (onNavigate) onNavigate(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#080810] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={Zentrya} alt="Zentrya" className="w-10 h-10" />
              <span className="text-white font-bold text-xl">Zentrya</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              One platform, total protection. Scan URLs, analyze emails, fetch metadata, and take down malicious websites — all in one secure dashboard.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Tools</h4>
            <ul className="space-y-2.5">
              {toolLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.label}>
                    <button
                      onClick={() => handleScroll(link.section)}
                      className="flex items-center gap-2 text-gray-400 text-sm hover:text-purple-400 transition"
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Pages */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Pages</h4>
            <ul className="space-y-2.5">
              {pageLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNav(link.tab)}
                    className="text-gray-400 text-sm hover:text-purple-400 transition"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Info */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">About</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <HiOutlineShieldCheck className="w-4 h-4 text-purple-400" />
                Cybersecurity Platform
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <HiOutlineGlobe className="w-4 h-4 text-purple-400" />
                AI-Powered Scanning
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <HiOutlineMail className="w-4 h-4 text-purple-400" />
                security@zentrya.com
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
            &copy; {currentYear} Zentrya. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-gray-600 text-xs hover:text-gray-400 cursor-pointer transition">Privacy Policy</span>
            <span className="text-gray-600 text-xs hover:text-gray-400 cursor-pointer transition">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}