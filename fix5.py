import os

def patch_file_raw(filepath, outpath, old_raw, new_raw):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    old_lf = old_raw.replace('\r\n', '\n')
    content_lf = content.replace('\r\n', '\n')
    if old_lf in content_lf:
        content = content_lf.replace(old_lf, new_raw)
        print("Successfully replaced raw in " + filepath)
    else:
        print("Raw not found!")
    with open(outpath, 'w', encoding='utf-8') as f:
        f.write(content)

old = """                                        <input
                                            type="text"
                                            placeholder="Add group..."
                                            className="text-xs px-2 py-1.5 border border-slate-200 rounded-md w-full focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                                            onKeyDown={(e) => {"""

new = """                                        <input
                                            type="text"
                                            placeholder="Add group..."
                                            className="text-xs text-slate-900 px-2 py-1.5 border border-slate-200 rounded-md w-full focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                                            onKeyDown={(e) => {"""

patch_file_raw('./src/components/AdminDirectory.tsx', './src/components/AdminDirectory2.tsx', old, new)
print("Done")
