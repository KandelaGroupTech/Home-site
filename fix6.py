import os

def patch_file_raw(filepath, outpath, old_raw, new_raw):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    old_lf = old_raw.replace('\r\n', '\n')
    content_lf = content.replace('\r\n', '\n')
    if old_lf in content_lf:
        content = content_lf.replace(old_lf, new_raw.replace('\r\n', '\n'))
        print("Successfully replaced raw in " + filepath)
    else:
        print("Raw not found!")
    with open(outpath, 'w', encoding='utf-8') as f:
        f.write(content)

old_import = """import { signInWithEmailAndPassword, getMultiFactorResolver, TotpMultiFactorGenerator } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';"""

new_import = """import { signInWithEmailAndPassword, getMultiFactorResolver, TotpMultiFactorGenerator } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { Eye, EyeOff } from 'lucide-react';"""

old_state = """    const [error, setError] = useState<string | null>(null);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetSent, setResetSent] = useState(false);"""

new_state = """    const [error, setError] = useState<string | null>(null);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [resetSent, setResetSent] = useState(false);"""

old_input = """                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white focus:border-[#006464] focus:outline-none transition-colors text-sm font-light"
                                required
                            />"""

new_input = """                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded p-2 pr-10 text-white focus:border-[#006464] focus:outline-none transition-colors text-sm font-light"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white focus:outline-none transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>"""

def run_patches():
    with open('./src/pages/LoginPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace(old_import.replace('\\r\\n', '\\n'), new_import.replace('\\r\\n', '\\n'))
    content = content.replace(old_state.replace('\\r\\n', '\\n'), new_state.replace('\\r\\n', '\\n'))
    content = content.replace(old_input.replace('\\r\\n', '\\n'), new_input.replace('\\r\\n', '\\n'))
    
    with open('./src/pages/LoginPage2.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

run_patches()
print("Done")
