import os

def patch_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        # Normalize to LF
        old_lf = old.replace('\r\n', '\n')
        content_lf = content.replace('\r\n', '\n')
        
        if old_lf in content_lf:
            content = content_lf.replace(old_lf, new)
            print(f"Successfully replaced in {filepath}")
        else:
            print(f"FAILED to find target in {filepath}:\n{old[:100]}...")
            
    with open(filepath.replace('.tsx', '2.tsx'), 'w', encoding='utf-8') as f:
        f.write(content)

up_reps = [
    (
        '                    <div className="flex gap-4">\n                        {[\'all\', \'specific_users\'].map(opt => (\n                            <label key={opt} className={`flex items-center gap-2.5 cursor-pointer px-4 py-3 rounded-lg border flex-1 transition-all ${audience === opt ? \'border-teal-400 bg-teal-50\' : \'border-slate-200 hover:border-teal-200\'}`}>\n                                <input type="radio" name="audience" value={opt} checked={audience === opt} onChange={() => setAudience(opt)} className="text-teal-600 focus:ring-teal-500" />\n                                <div>\n                                    <p className={`text-sm font-medium ${audience === opt ? \'text-teal-800\' : \'text-slate-600\'}`}>\n                                        {opt === \'all\' ? \'All Investors\' : \'Specific Investors\'}\n                                    </p>\n                                    <p className="text-xs text-slate-400 font-light">\n                                        {opt === \'all\' ? \'Visible to everyone\' : \'Choose recipients below\'}\n                                    </p>\n                                </div>\n                            </label>\n                        ))}\n                    </div>\n\n                    {audience === \'specific_users\' && (',
        '                    <div className="flex flex-col sm:flex-row gap-4">\n                        {[\'all\', \'groups\', \'specific_users\'].map(opt => (\n                            <label key={opt} className={`flex items-center gap-2.5 cursor-pointer px-4 py-3 rounded-lg border flex-1 transition-all ${audience === opt ? \'border-teal-400 bg-teal-50\' : \'border-slate-200 hover:border-teal-200\'}`}>\n                                <input type="radio" name="audience" value={opt} checked={audience === opt} onChange={() => setAudience(opt)} className="text-teal-600 focus:ring-teal-500" />\n                                <div>\n                                    <p className={`text-sm font-medium ${audience === opt ? \'text-teal-800\' : \'text-slate-600\'}`}>\n                                        {opt === \'all\' && \'All Investors\'}\n                                        {opt === \'groups\' && \'Specific Groups\'}\n                                        {opt === \'specific_users\' && \'Specific Investors\'}\n                                    </p>\n                                    <p className="text-xs text-slate-400 font-light">\n                                        {opt === \'all\' && \'Visible to everyone\'}\n                                        {opt === \'groups\' && \'Target custom groups\'}\n                                        {opt === \'specific_users\' && \'Choose individuals\'}\n                                    </p>\n                                </div>\n                            </label>\n                        ))}\n                    </div>\n\n                    {audience === \'groups\' && (\n                        <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-5">\n                            <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-3">Select Groups</label>\n                            {uniqueGroups.length === 0 ? (\n                                <p className="text-sm text-slate-500 italic">No groups exist yet.</p>\n                            ) : (\n                                <div className="flex flex-wrap gap-2 mb-4">\n                                    {uniqueGroups.map(group => (\n                                        <label key={group} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors text-sm font-medium ${selectedGroups.includes(group) ? \'bg-teal-50 border-teal-300 text-teal-800\' : \'bg-white border-slate-200 text-slate-600 hover:border-teal-200\'}`}>\n                                            <input \n                                                type="checkbox" \n                                                checked={selectedGroups.includes(group)}\n                                                onChange={() => handleGroupToggle(group)}\n                                                className="hidden"\n                                            />\n                                            {group}\n                                        </label>\n                                    ))}\n                                </div>\n                            )}\n                            <p className="text-sm font-medium text-teal-700">\n                                This document will be visible to {usersList.filter(u => u.groups?.some(g => selectedGroups.includes(g))).length} investor(s).\n                            </p>\n                        </div>\n                    )}\n\n                    {audience === \'specific_users\' && ('
    )
]

patch_file('./src/components/AdminDocumentUpload.tsx', up_reps)
print("Done")
