const fs = require('fs');

try {
    let types = fs.readFileSync('./src/types.ts', 'utf8');
    types = types.replace('onboardingCompleted?: boolean;\n    ndaSigned?: boolean;\n    ndaSignedAt?: any; // Firestore Timestamp\n    updatedAt: any; // Firestore Timestamp\n}', 'onboardingCompleted?: boolean;\n    ndaSigned?: boolean;\n    ndaSignedAt?: any; // Firestore Timestamp\n    updatedAt: any; // Firestore Timestamp\n    groups?: string[];\n}');
    fs.writeFileSync('./src/types.ts', types);

    let dir = fs.readFileSync('./src/components/AdminDirectory.tsx', 'utf8');
    dir = dir.replace(/import \{ collection, getDocs, doc, setDoc, serverTimestamp, deleteDoc, addDoc \} from 'firebase\/firestore';/, "import { collection, getDocs, doc, setDoc, serverTimestamp, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';");
    dir = dir.replace(/const exportToCSV = \(\) => \{[\s\S]*?document\.body\.removeChild\(link\);\n    \};/g, `const exportToCSV = () => {
        if (filtered.length === 0) return;
        const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Groups', 'Accredited Status', 'Check Size', 'Open to Deals'];
        const rows = filtered.map(u => [
            u.firstName || '',
            u.lastName || '',
            u.email || '',
            u.phone || '',
            u.company || '',
            (u.groups || []).join(', '),
            u.preferences?.accreditedStatus || 'Unknown',
            u.preferences?.checkSize || '',
            u.preferences?.openToNewDeals ? 'Yes' : 'No'
        ].map(v => \`"\\$\\{v.replace(/"/g, '""')\\}"\`).join(','));
        
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", \`investor_directory_\\$\\{new Date().toISOString().split('T')[0]\\}.csv\`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleAddGroup = async (uid, currentGroups, newGroup) => {
        const trimmed = newGroup.trim();
        if (!trimmed || currentGroups.includes(trimmed)) return;
        try {
            await updateDoc(doc(db, 'users', uid), { groups: [...currentGroups, trimmed] });
            fetchUsers();
        } catch (e) {
            console.error('Error adding group', e);
        }
    };

    const handleRemoveGroup = async (uid, currentGroups, groupToRemove) => {
        try {
            await updateDoc(doc(db, 'users', uid), { groups: currentGroups.filter(g => g !== groupToRemove) });
            fetchUsers();
        } catch (e) {
            console.error('Error removing group', e);
        }
    };`);
    dir = dir.replace(/<th className="px-5 py-4">Company<\/th>\s*<th className="px-5 py-4">Accredited<\/th>/, `<th className="px-5 py-4">Company</th>\n                                <th className="px-5 py-4 min-w-[200px]">Groups</th>\n                                <th className="px-5 py-4">Accredited</th>`);
    dir = dir.replace(/<td className="px-5 py-4 text-sm text-slate-600">\{user\.company \|\| <span className="text-slate-300">-<\/span>\}<\/td>\s*<td className="px-5 py-4">/, `<td className="px-5 py-4 text-sm text-slate-600">{user.company || <span className="text-slate-300">-</span>}</td>
                                    <td className="px-5 py-4 align-top">
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {user.groups?.map(group => (
                                                <span key={group} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
                                                    {group}
                                                    <button onClick={() => handleRemoveGroup(user.uid, user.groups || [], group)} className="hover:text-teal-900 focus:outline-none">X</button>
                                                </span>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Add group..."
                                            className="text-xs px-2 py-1.5 border border-slate-200 rounded-md w-full focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddGroup(user.uid, user.groups || [], e.currentTarget.value);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                    </td>
                                    <td className="px-5 py-4">`);
    fs.writeFileSync('./src/components/AdminDirectory.tsx', dir);

    let ann = fs.readFileSync('./src/components/AdminAnnouncements.tsx', 'utf8');
    if (!ann.includes('selectedGroups')) {
        ann = ann.replace(/const \[selectedUids, setSelectedUids\] = useState<string\[\]>\(\[\]\);/, `const [selectedUids, setSelectedUids] = useState<string[]>([]);\n    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);`);
        ann = ann.replace(/const uniqueCheckSizes = Array\.from\(new Set\(users\.map\(u => u\.preferences\?\.checkSize\)\.filter\(Boolean\)\)\)\.sort\(\) as string\[\];/, `const uniqueCheckSizes = Array.from(new Set(users.map(u => u.preferences?.checkSize).filter(Boolean))).sort() as string[];\n    const uniqueGroups = Array.from(new Set(users.flatMap(u => u.groups || []))).sort() as string[];`);
        ann = ann.replace(/return matchCompany && matchAccredited && matchCheckSize && matchDeals;\n    \}\);/, `return matchCompany && matchAccredited && matchCheckSize && matchDeals;\n    });\n\n    const matchedGroupUsers = users.filter(u => \n        u.groups?.some(g => selectedGroups.includes(g))\n    );`);
        ann = ann.replace(/setSelectedUids\(\[\.\.\.selectedUids, uid\]\);\n        \}\n    \};/, `setSelectedUids([...selectedUids, uid]);\n        }\n    };\n\n    const toggleGroupSelection = (group: string) => {\n        if (selectedGroups.includes(group)) {\n            setSelectedGroups(selectedGroups.filter(g => g !== group));\n        } else {\n            setSelectedGroups([...selectedGroups, group]);\n        }\n    };`);
        ann = ann.replace(/allowed_uids = matchedCategoryUsers\.map\(u => u\.uid\);\n        \} else if \(targetType === 'individuals'\) \{/, `allowed_uids = matchedCategoryUsers.map(u => u.uid);\n        } else if (targetType === 'groups') {\n            if (selectedGroups.length === 0) {\n                alert("Please select at least one group.");\n                return;\n            }\n            if (matchedGroupUsers.length === 0) {\n                alert("Your selected groups do not match any investors.");\n                return;\n            }\n            target_audience = 'custom';\n            allowed_uids = matchedGroupUsers.map(u => u.uid);\n        } else if (targetType === 'individuals') {`);
        ann = ann.replace(/targetType === 'category' \n                \? matchedCategoryUsers \n                : users\.filter\(u => selectedUids\.includes\(u\.uid\)\);/, `targetType === 'category' \n                ? matchedCategoryUsers \n                : targetType === 'groups'\n                    ? matchedGroupUsers\n                    : users.filter(u => selectedUids.includes(u.uid));`);
        ann = ann.replace(/setSelectedUids\(\[\]\);\n            setSelectedFiles\(\[\]\);/, `setSelectedUids([]);\n            setSelectedGroups([]);\n            setSelectedFiles([]);`);
        ann = ann.replace(/\{targetType === type && <div className="w-2 h-2 rounded-full bg-teal-600" \/>\}\n                                        <\/div>\n                                    <\/div>\n                                <\/button>\n                            \)\)\}\n                        <\/div>/, `{targetType === type && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>`);
        ann = ann.replace(/\{targetType === type && <div className="w-2 h-2 rounded-full bg-teal-600" \/>\}/, `{targetType === type && <div className="w-2 h-2 rounded-full bg-teal-600" />}`);
        ann = ann.replace(/\{targetType === type && <div className="w-2 h-2 rounded-full bg-teal-600" \/>\}\n                                        <\/div>\n                                    <\/div>\n                                <\/button>\n                            \)\)\}\n                        <\/div>/, `{targetType === type && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>`);
        ann = ann.replace(/\{targetType === type && <div className="w-2 h-2 rounded-full bg-teal-600" \/>\}/, `{targetType === type && <div className="w-2 h-2 rounded-full bg-teal-600" />}`);
        ann = ann.replace(/\['all', 'category', 'individuals'\]\.map/, `['all', 'category', 'groups', 'individuals'].map`);
        ann = ann.replace(/\{type === 'category' && 'Filter by Category'\}/, `{type === 'category' && 'Filter by Category'}\n                                        {type === 'groups' && 'Target by Group'}`);
        ann = ann.replace(/\{\/\* Individual Targeting \*\/\}/, `{/* Group Targeting */}
                    {targetType === 'groups' && (
                        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
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
                                    This message will be sent to {matchedGroupUsers.length} investor(s).
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Individual Targeting */}`);
        fs.writeFileSync('./src/components/AdminAnnouncements.tsx', ann);
    }
    
    console.log("Patch successful");
} catch(e) {
    console.error(e);
}
