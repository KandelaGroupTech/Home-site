import React, { useEffect, useState } from 'react';
import { X, Send, Check } from 'lucide-react';
import emailjs from '@emailjs/browser';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = 'unset';
      
      // Reset form after animation completes
      const resetTimer = setTimeout(() => {
        setFormData({ name: '', email: '', message: '' });
        setErrors({});
        setIsSuccess(false);
      }, 300);

      return () => {
        clearTimeout(timer);
        clearTimeout(resetTimer);
      };
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSending(true);
      
      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          {
            name: formData.name,
            email: formData.email,
            message: formData.message,
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
        
        setIsSuccess(true);
        // Close modal after a delay
        setTimeout(() => {
          onClose();
        }, 2500);
      } catch (error) {
        console.error("Failed to send email:", error);
        alert("There was an error sending your message. Please try again later.");
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

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
        className={`relative w-full max-w-lg bg-[#0a0f1e] border border-white/10 shadow-2xl p-8 md:p-10 transition-all duration-500 ease-out transform ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-10"
        >
          <X size={24} strokeWidth={1.5} />
        </button>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#006464]/10 flex items-center justify-center mb-6 border border-[#006464]/30">
              <Check size={32} className="text-[#006464]" strokeWidth={1.5} />
            </div>
            <h2 className="font-serif text-3xl text-white mb-3">Message Sent!</h2>
            <p className="text-slate-400 font-light text-sm max-w-xs mx-auto leading-relaxed">
              Your message has been sent successfully. We will get back to you shortly.
            </p>
          </div>
        ) : (
          <>
            <h2 className="font-serif text-3xl text-white mb-2">Get in Touch</h2>
            <p className="text-slate-400 font-light text-sm mb-8">
              Interested in working with The Kandela Group? Send us a message.
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full bg-white/5 border p-3 text-white focus:outline-none focus:bg-white/10 transition-all duration-300 font-light ${
                    errors.name 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-white/10 focus:border-[#006464]'
                  }`}
                  placeholder="Your Name"
                />
                {errors.name && (
                  <span className="text-xs text-red-400 font-light tracking-wide animate-pulse">{errors.name}</span>
                )}
              </div>
              
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">Email</label>
                <input 
                  type="text" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-white/5 border p-3 text-white focus:outline-none focus:bg-white/10 transition-all duration-300 font-light ${
                    errors.email 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-white/10 focus:border-[#006464]'
                  }`}
                  placeholder="email@company.com"
                />
                {errors.email && (
                  <span className="text-xs text-red-400 font-light tracking-wide animate-pulse">{errors.email}</span>
                )}
              </div>
              
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">Message</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full bg-white/5 border p-3 text-white focus:outline-none focus:bg-white/10 transition-all duration-300 font-light resize-none ${
                    errors.message 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-white/10 focus:border-[#006464]'
                  }`}
                  placeholder="Tell us about your project..."
                />
                {errors.message && (
                  <span className="text-xs text-red-400 font-light tracking-wide animate-pulse">{errors.message}</span>
                )}
              </div>

              <button 
                type="submit"
                disabled={isSending}
                className="w-full bg-[#006464] hover:bg-[#005050] text-white py-4 text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group mt-2 border border-transparent hover:border-[#007d7d] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isSending ? 'Sending...' : 'Send Message'}</span>
                {!isSending && <Send size={14} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactModal;