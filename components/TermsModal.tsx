import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
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

        <h2 className="font-serif text-3xl text-white mb-6 flex-shrink-0">Terms of Service</h2>
        
        <div className="overflow-y-auto pr-4 -mr-2 text-slate-400 font-light text-sm leading-relaxed space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <p>
            Welcome to The Kandela Group. By accessing our website, you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
          </p>

          <h3 className="text-white font-medium text-base mt-6 mb-2">1. Use License</h3>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on The Kandela Group's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license, you may not:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>modify or copy the materials;</li>
            <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
            <li>attempt to decompile or reverse engineer any software contained on The Kandela Group's website;</li>
            <li>remove any copyright or other proprietary notations from the materials; or</li>
            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>

          <h3 className="text-white font-medium text-base mt-6 mb-2">2. Disclaimer</h3>
          <p>
            The materials on The Kandela Group's website are provided on an 'as is' basis. The Kandela Group makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>

          <h3 className="text-white font-medium text-base mt-6 mb-2">3. Limitations</h3>
          <p>
            In no event shall The Kandela Group or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on The Kandela Group's website, even if The Kandela Group or a The Kandela Group authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>
          
          <h3 className="text-white font-medium text-base mt-6 mb-2">4. Governing Law</h3>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of the State of Delaware and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;