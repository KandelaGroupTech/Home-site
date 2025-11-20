import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 backdrop-blur-none pointer-events-none'}`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div 
        className={`relative w-full max-w-2xl bg-[#0a0f1e] border border-white/10 shadow-2xl p-8 md:p-10 transition-all duration-500 ease-out transform max-h-[80vh] flex flex-col ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-10"
        >
          <X size={24} strokeWidth={1.5} />
        </button>

        <h2 className="font-serif text-3xl text-white mb-6 flex-shrink-0">Privacy Policy</h2>
        
        <div className="overflow-y-auto pr-4 -mr-2 text-slate-400 font-light text-sm leading-relaxed space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <p>
            At The Kandela Group, we respect your privacy and are committed to protecting the personal information you share with us. This policy explains how we collect, use, and safeguard your information.
          </p>

          <h3 className="text-white font-medium text-base mt-6 mb-2">1. Information We Collect</h3>
          <p>
            We may collect personal information such as your name, email address, and other contact details when you voluntarily fill out forms on our website or communicate with us directly. We also automatically collect certain non-personal information about your visit, such as your IP address, browser type, and operating system.
          </p>

          <h3 className="text-white font-medium text-base mt-6 mb-2">2. How We Use Your Information</h3>
          <p>
            The information we collect is used to:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Provide, operate, and maintain our website;</li>
            <li>Respond to your inquiries, comments, or feedback;</li>
            <li>Improve our services and website functionality;</li>
            <li>Send you updates or information related to The Kandela Group, if you have opted in to receive such communications.</li>
          </ul>

          <h3 className="text-white font-medium text-base mt-6 mb-2">3. Cookies and Tracking</h3>
          <p>
            We use cookies and similar tracking technologies to track the activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
          </p>
          
          <h3 className="text-white font-medium text-base mt-6 mb-2">4. Data Security</h3>
          <p>
            We strive to use commercially acceptable means to protect your Personal Data. However, no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
          </p>

          <h3 className="text-white font-medium text-base mt-6 mb-2">5. Third-Party Links</h3>
          <p>
            Our website may contain links to other sites that are not operated by us. If you click a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;