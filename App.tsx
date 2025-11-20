import React, { useEffect, useState } from 'react';
import { LineChart, Briefcase, Clapperboard, ChevronDown, Mail } from 'lucide-react';
import CompanyCard from './components/CompanyCard';
import ContactModal from './components/ContactModal';
import TermsModal from './components/TermsModal';
import PrivacyModal from './components/PrivacyModal';
import { CompanyProfile } from './types';

const companies: CompanyProfile[] = [
  {
    id: '1',
    name: 'Ronak Ventures',
    description: 'Strategic capital providing access to value creation opportunities in the lower middle market to middle class individuals.',
    icon: LineChart,
    href: '#',
  },
  {
    id: '2',
    name: 'Ronak Advisory',
    description: 'A specialized mergers and acquisitions transaction advisory shop facilitating complex financial dealings in the lower middle market.',
    icon: Briefcase,
    href: '#',
  },
  {
    id: '3',
    name: 'Ronak Studios',
    description: 'A forward-thinking media house dedicated to producing high-quality, impactful content across various digital platforms.',
    icon: Clapperboard,
    href: '#',
  }
];

const App: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsContactOpen(true);
  };

  const handleScrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-200 overflow-x-hidden selection:bg-[#006464] selection:text-white">

      {/* Ambient Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-[#006464] opacity-[0.08] blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-[#006464] opacity-[0.05] blur-[100px] rounded-full mix-blend-screen"></div>
        {/* Noise Texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      <main className="relative z-10 flex flex-col min-h-screen px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">

        {/* Navigation / Header (Minimal) */}
        <header className={`flex justify-between items-center py-10 transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
          <a
            href="#"
            onClick={handleScrollToTop}
            className="flex items-center gap-2 group cursor-pointer"
            aria-label="Scroll to top"
          >
            <div className="w-3 h-3 bg-[#006464] rounded-full transition-all duration-500 ease-out group-hover:scale-125 group-hover:bg-[#007d7d] group-hover:shadow-[0_0_15px_rgba(0,100,100,0.6)]"></div>
            <span className="text-xs font-light tracking-[0.2em] text-slate-400 uppercase transition-colors duration-300 group-hover:text-slate-200">Holding Corp</span>
          </a>
          <nav>
            <a
              href="#"
              onClick={handleContactClick}
              className="text-xs font-light tracking-widest text-slate-500 hover:text-white transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-px after:bg-[#006464] hover:after:w-full after:transition-all after:duration-300"
            >
              CONTACT
            </a>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="flex-grow flex flex-col justify-center items-center text-center py-20 lg:py-32">
          <div className={`transition-all duration-1000 ease-out delay-300 transform ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white tracking-tight mb-6 leading-[1.1]">
              THE KANDELA <span className="text-[#006464]">GROUP</span>
            </h1>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#006464] to-transparent mx-auto mb-8"></div>
            <p className="max-w-2xl mx-auto text-sm md:text-base text-slate-400 font-light tracking-wide leading-relaxed">
              Architecting the future through strategic capital allocation. We build, acquire, and elevate premier companies across finance, advisory, and media sectors.
            </p>
          </div>

          {/* Scroll Indicator */}
          <div className={`mt-24 transition-opacity duration-1000 delay-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
            <a
              href="#portfolio"
              onClick={(e) => handleScrollToSection(e, 'portfolio')}
              className="inline-block animate-bounce cursor-pointer"
              aria-label="Scroll to portfolio"
            >
              <ChevronDown className="text-slate-600 hover:text-[#006464] transition-colors duration-300" size={24} strokeWidth={1} />
            </a>
          </div>
        </section>

        {/* Portfolio Grid Section */}
        <section id="portfolio" className="w-full pb-24 scroll-mt-24">
          <div className={`mb-12 flex items-center gap-4 transition-all duration-1000 delay-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
            <span className="h-px w-8 bg-[#006464]"></span>
            <h2 className="text-xs font-light tracking-[0.3em] uppercase text-slate-400">Our Portfolio</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {companies.map((company, index) => (
              <CompanyCard key={company.id} company={company} index={index} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-600 font-light tracking-wider">

          {/* Copyright */}
          <p className="order-2 md:order-1">&copy; {new Date().getFullYear()} The Kandela Group LLC. All Rights Reserved.</p>

          {/* Social Icons */}
          <div className="flex items-center gap-6 order-1 md:order-2">
            <a href="#" className="group" aria-label="X">
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                className="text-slate-600 fill-current transition-all duration-300 group-hover:text-teal-400 group-hover:scale-125 group-hover:-translate-y-1"
              >
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
              </svg>
            </a>
            <a href="mailto:info@thekandelagroup.com" className="group" aria-label="Email">
              <Mail size={18} strokeWidth={1.5} className="text-slate-600 transition-all duration-300 group-hover:text-teal-400 group-hover:scale-125 group-hover:-translate-y-1" />
            </a>
          </div>

          {/* Legal Links */}
          <div className="flex gap-6 order-3 md:order-3">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsPrivacyOpen(true);
              }}
              className="hover:text-teal-400 transition-all duration-300 hover:scale-105 inline-block"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsTermsOpen(true);
              }}
              className="hover:text-teal-400 transition-all duration-300 hover:scale-105 inline-block"
            >
              Terms of Service
            </a>
          </div>
        </footer>

      </main>

      {/* Modals */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
};

export default App;