import os

def run_patches():
    with open('./src/pages/OnboardingWizard.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    old_import = "import { Shield, ChevronRight, CheckCircle2, KeyRound } from 'lucide-react';"
    new_import = "import { Shield, ChevronRight, CheckCircle2, KeyRound, Info } from 'lucide-react';"
    
    old_accred_label = '<label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">Accreditation Status</label>'
    new_accred_label = """<label className="text-xs text-slate-500 uppercase tracking-wider font-medium flex items-center gap-1.5 mb-1.5">
                                        Accreditation Status
                                        <div className="group relative flex items-center">
                                            <Info size={14} className="text-slate-400 hover:text-teal-600 cursor-help" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-slate-800 text-white text-[11px] leading-relaxed rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 font-normal normal-case pointer-events-none">
                                                US standards generally require an annual income of $200K+ ($300K+ with spouse) for the last two years, or a net worth exceeding $1M (excluding primary residence).
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                            </div>
                                        </div>
                                    </label>"""
                                    
    old_check_label = '<label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">Typical Check Size</label>'
    new_check_label = """<label className="text-xs text-slate-500 uppercase tracking-wider font-medium flex items-center gap-1.5 mb-1.5">
                                        Typical Check Size
                                        <div className="group relative flex items-center">
                                            <Info size={14} className="text-slate-400 hover:text-teal-600 cursor-help" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-slate-800 text-white text-[11px] leading-relaxed rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 font-normal normal-case pointer-events-none">
                                                The estimated dollar amount you expect to invest in a single, typical deal on our platform.
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                            </div>
                                        </div>
                                    </label>"""
    
    content = content.replace(old_import, new_import)
    content = content.replace(old_accred_label, new_accred_label)
    content = content.replace(old_check_label, new_check_label)
    
    with open('./src/pages/OnboardingWizard2.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

run_patches()
print("Done")
