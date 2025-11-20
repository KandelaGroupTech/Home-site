import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CompanyProfile } from '../types';

interface CompanyCardProps {
  company: CompanyProfile;
  index: number;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, index }) => {
  // Staggered animation delay based on index
  const animationDelay = `${(index + 1) * 200}ms`;

  return (
    <a
      href={company.href}
      className="group relative flex flex-col justify-between p-8 bg-white/5 border border-white/10 hover:border-[#006464] backdrop-blur-sm transition-all duration-500 ease-out hover:bg-white/[0.07] hover:-translate-y-1 min-h-[280px] opacity-0 animate-slide-up overflow-hidden"
      style={{ animationDelay }}
    >
      {/* Glow Effect */}
      <div className="absolute -right-20 -top-20 w-40 h-40 bg-[#006464] opacity-0 group-hover:opacity-20 blur-[80px] transition-opacity duration-700 pointer-events-none" />

      <div className="relative z-10">
        <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white group-hover:text-[#006464] group-hover:border-[#006464]/50 transition-colors duration-300">
          <company.icon size={20} strokeWidth={1.5} />
        </div>
        
        <h3 className="text-xl font-light tracking-wide text-white mb-3 group-hover:text-[#006464] transition-colors duration-300">
          {company.name}
        </h3>
        
        <p className="text-sm text-slate-400 leading-relaxed font-light tracking-wide">
          {company.description}
        </p>
      </div>

      <div className="relative z-10 flex items-center justify-end mt-8">
        <span className="text-xs tracking-widest uppercase text-slate-500 group-hover:text-white transition-colors duration-300 mr-2">
          Visit
        </span>
        <ArrowUpRight 
          size={16} 
          className="text-slate-500 group-hover:text-[#006464] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" 
        />
      </div>
    </a>
  );
};

export default CompanyCard;