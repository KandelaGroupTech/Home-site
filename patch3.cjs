const fs = require('fs');

try {
    let docUpload = fs.readFileSync('./src/components/AdminDocumentUpload.tsx', 'utf8');
    if (!docUpload.includes('selectedGroups')) {
        docUpload = docUpload.replace(/const \[selectedUids, setSelectedUids\] = useState<string\[\]>\(\[\]\);/, `const [selectedUids, setSelectedUids] = useState<string[]>([]);\n    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);`);
        docUpload = docUpload.replace(/const uniqueCheckSizes = Array\.from\(new Set\(users\.map\(u => u\.preferences\?\.checkSize\)\.filter\(Boolean\)\)\)\.sort\(\) as string\[\];/, `const uniqueCheckSizes = Array.from(new Set(users.map(u => u.preferences?.checkSize).filter(Boolean))).sort() as string[];\n    const uniqueGroups = Array.from(new Set(users.flatMap(u => u.groups || []))).sort() as string[];`);
        docUpload = docUpload.replace(/return matchCompany && matchAccredited && matchCheckSize && matchDeals;\n    \}\);/, `return matchCompany && matchAccredited && matchCheckSize && matchDeals;\n    });\n\n    const matchedGroupUsers = users.filter(u => \n        u.groups?.some(g => selectedGroups.includes(g))\n    );`);
        docUpload = docUpload.replace(/setSelectedUids\(\[\.\.\.selectedUids, uid\]\);\n        \}\n    \};/, `setSelectedUids([...selectedUids, uid]);\n        }\n    };\n\n    const toggleGroupSelection = (group: string) => {\n        if (selectedGroups.includes(group)) {\n            setSelectedGroups(selectedGroups.filter(g => g !== group));\n        } else {\n            setSelectedGroups([...selectedGroups, group]);\n        }\n    };`);
        docUpload = docUpload.replace(/allowed_uids = matchedCategoryUsers\.map\(u => u\.uid\);\n            \} else if \(targetType === 'individuals'\) \{/, `allowed_uids = matchedCategoryUsers.map(u => u.uid);\n            } else if (targetType === 'groups') {\n                if (selectedGroups.length === 0) {\n                    alert("Please select at least one group.");\n                    return;\n                }\n                if (matchedGroupUsers.length === 0) {\n                    alert("Your selected groups do not match any investors.");\n                    return;\n                }\n                target_audience = 'custom';\n                allowed_uids = matchedGroupUsers.map(u => u.uid);\n            } else if (targetType === 'individuals') {`);
        docUpload = docUpload.replace(/targetType === 'category' \n                                \? matchedCategoryUsers \n                                : users\.filter\(u => selectedUids\.includes\(u\.uid\)\);/, `targetType === 'category' \n                                ? matchedCategoryUsers \n                                : targetType === 'groups'\n                                    ? matchedGroupUsers\n                                    : users.filter(u => selectedUids.includes(u.uid));`);
        docUpload = docUpload.replace(/setSelectedUids\(\[\]\);\n            setSelectedFiles\(\[\]\);/, `setSelectedUids([]);\n            setSelectedGroups([]);\n            setSelectedFiles([]);`);
        docUpload = docUpload.replace(/\{targetType === type && <div className="w-2 h-2 rounded-full bg-teal-600" \/>\}\n                                                <\/div>\n                                            <\/div>\n                                        <\/button>\n                                    \)\)\}\n                                <\/div>/, `{targetType === type && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>`);
        docUpload = docUpload.replace(/\{targetType === type && <div className="w-2 h-2 rounded-full bg-teal-600" \/>\}/, `{targetType === type && <div className="w-2 h-2 rounded-full bg-teal-600" />}`);
        docUpload = docUpload.replace(/\{targetType === type && <div className="w-2 h-2 rounded-full bg-teal-600" \/>\}\n                                                <\/div>\n                                            <\/div>\n                                        <\/button>\n                                    \)\)\}\n                                <\/div>/, `{targetType === type && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>`);
        docUpload = docUpload.replace(/\{targetType === type && <div className="w-2 h-2 rounded-full bg-teal-600" \/>\}/, `{targetType === type && <div className="w-2 h-2 rounded-full bg-teal-600" />}`);
        docUpload = docUpload.replace(/\['all', 'category', 'individuals'\]\.map/, `['all', 'category', 'groups', 'individuals'].map`);
        docUpload = docUpload.replace(/\{type === 'category' && 'Filter by Category'\}/, `{type === 'category' && 'Filter by Category'}\n                                                {type === 'groups' && 'Specific Groups'}`);
        docUpload = docUpload.replace(/\{\/\* Individual Targeting \*\/\}/, `{/* Group Targeting */}
                            {targetType === 'groups' && (
                                <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl mb-6">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-3">Select Groups</label>
                                    {uniqueGroups.length === 0 ? (
                                        <p className="text-sm text-slate-500 italic">No groups exist yet.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {uniqueGroups.map(group => (
                                                <label key={group} className={\`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors text-sm font-medium \${selectedGroups.includes(group) ? 'bg-teal-50 border-teal-300 text-teal-800' : 'bg-white border-slate-200 text-slate-600 hover:border-teal-200'}\`}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedGroups.includes(group)}
                                                        onChange={() => toggleGroupSelection(group)}
                                                        className="hidden"
                                                    />
                                                    {group}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    <div className="pt-2">
                                        <p className="text-sm font-medium text-teal-700 flex items-center gap-2">
                                            This document will be visible to {matchedGroupUsers.length} investor(s).
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Individual Targeting */}`);
        fs.writeFileSync('./src/components/AdminDocumentUpload.tsx', docUpload);
    }
    
    console.log("Patch 3 successful");
} catch(e) {
    console.error(e);
}
