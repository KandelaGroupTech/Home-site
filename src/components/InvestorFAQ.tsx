import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const InvestorFAQ: React.FC = () => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

    const faqs = [
        {
            q: "How do I access my documents?",
            a: "You can view and download all your general and financial documents by clicking the 'Documents' tab in the left navigation menu. To view tax specific documents, click on the 'Tax Documents' tab. Both areas allow you to select multiple files to download at once, or view them directly in your browser."
        },
        {
            q: "Where can I find my K-1 tax forms?",
            a: "All tax-related documents, including K-1s and Tax Distributions, are located in the dedicated 'Tax Documents' tab on the left navigation menu. This keeps them separate from your general investment summaries and capital calls."
        },
        {
            q: "How do I update my profile information?",
            a: "You can update your personal information, address, and investment preferences at any time by clicking the 'Edit Profile' button located in the top right corner of the Welcome page."
        },
        {
            q: "Who do I contact if I have a question about my investment?",
            a: "You can reach out to our team directly through the portal by clicking the 'Contact Us' tab. Messages sent through that form go directly to our investor relations team, and we will respond to you promptly via email or phone."
        },
        {
            q: "Are my documents secure?",
            a: "Yes. All documents uploaded to the Kandela Group Investor Portal are stored securely using enterprise-grade encryption. Furthermore, documents shared specifically with your account are protected by strict access rules and cannot be viewed by any other investor."
        }
    ];

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-1 h-8 bg-teal-600 rounded" />
                    <h1 className="text-3xl font-serif text-slate-800">FAQ</h1>
                </div>
                <p className="text-slate-500 font-light pl-4">Learn the answer to frequently asked questions.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {faqs.map((faq, idx) => {
                        const isOpen = expandedIndex === idx;
                        return (
                            <div key={idx} className="transition-all duration-300">
                                <button
                                    onClick={() => setExpandedIndex(isOpen ? null : idx)}
                                    className="w-full text-left p-6 flex items-start justify-between group hover:bg-slate-50 transition-colors"
                                >
                                    <h3 className={`font-medium pr-8 transition-colors ${isOpen ? 'text-teal-700' : 'text-slate-700 group-hover:text-teal-600'}`}>
                                        {faq.q}
                                    </h3>
                                    <div className={`p-1 rounded-full shrink-0 mt-0.5 transition-colors ${isOpen ? 'bg-teal-50 text-teal-600' : 'text-slate-400 group-hover:text-teal-500'}`}>
                                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                </button>
                                
                                {isOpen && (
                                    <div className="px-6 pb-6 text-slate-600 font-light text-sm leading-relaxed">
                                        <div className="pl-4 border-l-2 border-teal-100">
                                            {faq.a}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default InvestorFAQ;
