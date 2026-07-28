import os

def patch_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        if old not in content:
            print(f"FAILED to find target in {filepath}:\n{old[:100]}...")
            # try normalizing crlf
            old_crlf = old.replace('\n', '\r\n')
            if old_crlf in content:
                content = content.replace(old_crlf, new.replace('\n', '\r\n'))
                print("Found target with CRLF!")
            else:
                old_lf = old.replace('\r\n', '\n')
                content_lf = content.replace('\r\n', '\n')
                if old_lf in content_lf:
                    content = content_lf.replace(old_lf, new)
                    print("Found target with normalized LF!")
                else:
                    print("Still could not find it.")
        else:
            content = content.replace(old, new)
            print(f"Successfully replaced in {filepath}")
            
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# ADMIN DIRECTORY
dir_reps = [
    (
        "import { collection, getDocs, doc, setDoc, serverTimestamp, deleteDoc, addDoc } from 'firebase/firestore';",
        "import { collection, getDocs, doc, setDoc, serverTimestamp, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';"
    ),
    (
        "        const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Accredited Status', 'Check Size', 'Open to Deals'];",
        "        const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Groups', 'Accredited Status', 'Check Size', 'Open to Deals'];"
    ),
    (
        "            u.company || '',\n            u.preferences?.accreditedStatus || 'Unknown',",
        "            u.company || '',\n            (u.groups || []).join(', '),\n            u.preferences?.accreditedStatus || 'Unknown',"
    ),
    (
        "        document.body.removeChild(link);\n    };",
        "        document.body.removeChild(link);\n    };\n\n    const handleAddGroup = async (uid: string, currentGroups: string[], newGroup: string) => {\n        const trimmed = newGroup.trim();\n        if (!trimmed || currentGroups.includes(trimmed)) return;\n        try {\n            await updateDoc(doc(db, 'users', uid), { groups: [...currentGroups, trimmed] });\n            fetchUsers();\n        } catch (e) {\n            console.error('Error adding group', e);\n        }\n    };\n\n    const handleRemoveGroup = async (uid: string, currentGroups: string[], groupToRemove: string) => {\n        try {\n            await updateDoc(doc(db, 'users', uid), { groups: currentGroups.filter(g => g !== groupToRemove) });\n            fetchUsers();\n        } catch (e) {\n            console.error('Error removing group', e);\n        }\n    };"
    ),
    (
        "                                <th className=\"px-5 py-4\">Phone</th>\n                                <th className=\"px-5 py-4\">Company</th>\n                                <th className=\"px-5 py-4\">Accredited</th>",
        "                                <th className=\"px-5 py-4\">Phone</th>\n                                <th className=\"px-5 py-4\">Company</th>\n                                <th className=\"px-5 py-4 min-w-[200px]\">Groups</th>\n                                <th className=\"px-5 py-4\">Accredited</th>"
    ),
    (
        "                                    <td className=\"px-5 py-4 text-sm text-slate-600\">{user.phone || <span className=\"text-slate-300\">-</span>}</td>\n                                    <td className=\"px-5 py-4 text-sm text-slate-600\">{user.company || <span className=\"text-slate-300\">-</span>}</td>\n                                    <td className=\"px-5 py-4\">",
        "                                    <td className=\"px-5 py-4 text-sm text-slate-600\">{user.phone || <span className=\"text-slate-300\">-</span>}</td>\n                                    <td className=\"px-5 py-4 text-sm text-slate-600\">{user.company || <span className=\"text-slate-300\">-</span>}</td>\n                                    <td className=\"px-5 py-4 align-top\">\n                                        <div className=\"flex flex-wrap gap-1 mb-2\">\n                                            {user.groups?.map(group => (\n                                                <span key={group} className=\"inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200\">\n                                                    {group}\n                                                    <button onClick={() => handleRemoveGroup(user.uid, user.groups || [], group)} className=\"hover:text-teal-900 focus:outline-none\">X</button>\n                                                </span>\n                                            ))}\n                                        </div>\n                                        <input\n                                            type=\"text\"\n                                            placeholder=\"Add group...\"\n                                            className=\"text-xs px-2 py-1.5 border border-slate-200 rounded-md w-full focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400\"\n                                            onKeyDown={(e) => {\n                                                if (e.key === 'Enter') {\n                                                    e.preventDefault();\n                                                    handleAddGroup(user.uid, user.groups || [], e.currentTarget.value);\n                                                    e.currentTarget.value = '';\n                                                }\n                                            }}\n                                        />\n                                    </td>\n                                    <td className=\"px-5 py-4\">"
    )
]

patch_file('./src/components/AdminDirectory.tsx', dir_reps)

# ADMIN ANNOUNCEMENTS
ann_reps = [
    (
        "    // Individual Selection\n    const [selectedUids, setSelectedUids] = useState<string[]>([]);",
        "    // Individual Selection\n    const [selectedUids, setSelectedUids] = useState<string[]>([]);\n    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);"
    ),
    (
        "    const uniqueCompanies = Array.from(new Set(users.map(u => u.company).filter(Boolean))).sort() as string[];\n    const uniqueCheckSizes = Array.from(new Set(users.map(u => u.preferences?.checkSize).filter(Boolean))).sort() as string[];",
        "    const uniqueCompanies = Array.from(new Set(users.map(u => u.company).filter(Boolean))).sort() as string[];\n    const uniqueCheckSizes = Array.from(new Set(users.map(u => u.preferences?.checkSize).filter(Boolean))).sort() as string[];\n    const uniqueGroups = Array.from(new Set(users.flatMap(u => u.groups || []))).sort() as string[];"
    ),
    (
        "        return matchCompany && matchAccredited && matchCheckSize && matchDeals;\n    });",
        "        return matchCompany && matchAccredited && matchCheckSize && matchDeals;\n    });\n\n    const matchedGroupUsers = users.filter(u => \n        u.groups?.some(g => selectedGroups.includes(g))\n    );"
    ),
    (
        "    const toggleUserSelection = (uid: string) => {\n        if (selectedUids.includes(uid)) {\n            setSelectedUids(selectedUids.filter(id => id !== uid));\n        } else {\n            setSelectedUids([...selectedUids, uid]);\n        }\n    };",
        "    const toggleUserSelection = (uid: string) => {\n        if (selectedUids.includes(uid)) {\n            setSelectedUids(selectedUids.filter(id => id !== uid));\n        } else {\n            setSelectedUids([...selectedUids, uid]);\n        }\n    };\n\n    const toggleGroupSelection = (group: string) => {\n        if (selectedGroups.includes(group)) {\n            setSelectedGroups(selectedGroups.filter(g => g !== group));\n        } else {\n            setSelectedGroups([...selectedGroups, group]);\n        }\n    };"
    ),
    (
        "        if (targetType === 'category') {\n            if (matchedCategoryUsers.length === 0) {\n                alert(\"Your selected categories do not match any investors.\");\n                return;\n            }\n            target_audience = 'custom';\n            allowed_uids = matchedCategoryUsers.map(u => u.uid);\n        } else if (targetType === 'individuals') {\n            if (selectedUids.length === 0) {\n                alert(\"Please select at least one investor.\");\n                return;\n            }\n            target_audience = 'custom';\n            allowed_uids = selectedUids;\n        }\n\n        const targetedUsers = targetType === 'all' \n            ? users \n            : targetType === 'category' \n                ? matchedCategoryUsers \n                : users.filter(u => selectedUids.includes(u.uid));",
        "        if (targetType === 'category') {\n            if (matchedCategoryUsers.length === 0) {\n                alert(\"Your selected categories do not match any investors.\");\n                return;\n            }\n            target_audience = 'custom';\n            allowed_uids = matchedCategoryUsers.map(u => u.uid);\n        } else if (targetType === 'groups') {\n            if (selectedGroups.length === 0) {\n                alert(\"Please select at least one group.\");\n                return;\n            }\n            if (matchedGroupUsers.length === 0) {\n                alert(\"Your selected groups do not match any investors.\");\n                return;\n            }\n            target_audience = 'custom';\n            allowed_uids = matchedGroupUsers.map(u => u.uid);\n        } else if (targetType === 'individuals') {\n            if (selectedUids.length === 0) {\n                alert(\"Please select at least one investor.\");\n                return;\n            }\n            target_audience = 'custom';\n            allowed_uids = selectedUids;\n        }\n\n        const targetedUsers = targetType === 'all' \n            ? users \n            : targetType === 'category' \n                ? matchedCategoryUsers \n                : targetType === 'groups'\n                    ? matchedGroupUsers\n                    : users.filter(u => selectedUids.includes(u.uid));"
    ),
    (
        "            setTitle(''); \n            setContent('');\n            setSelectedUids([]);\n            setSelectedFiles([]);",
        "            setTitle(''); \n            setContent('');\n            setSelectedUids([]);\n            setSelectedGroups([]);\n            setSelectedFiles([]);"
    ),
    (
        "                        <div className=\"grid grid-cols-1 md:grid-cols-3 gap-3\">\n                            {['all', 'category', 'individuals'].map(type => (",
        "                        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3\">\n                            {['all', 'category', 'groups', 'individuals'].map(type => ("
    ),
    (
        "                                        {type === 'all' && 'All Investors'}\n                                        {type === 'category' && 'Filter by Category'}\n                                        {type === 'individuals' && 'Select Individuals'}",
        "                                        {type === 'all' && 'All Investors'}\n                                        {type === 'category' && 'Filter by Category'}\n                                        {type === 'groups' && 'Target by Group'}\n                                        {type === 'individuals' && 'Select Individuals'}"
    ),
    (
        "                    {/* Individual Targeting */}",
        "                    {/* Group Targeting */}\n                    {targetType === 'groups' && (\n                        <div className=\"bg-slate-50 border border-slate-200 p-5 rounded-xl\">\n                            <label className=\"text-xs text-slate-500 uppercase tracking-wider font-medium block mb-3\">Select Groups</label>\n                            {uniqueGroups.length === 0 ? (\n                                <p className=\"text-sm text-slate-500 italic\">No groups exist yet.</p>\n                            ) : (\n                                <div className=\"flex flex-wrap gap-2 mb-4\">\n                                    {uniqueGroups.map(group => (\n                                        <label key={group} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors text-sm font-medium ${selectedGroups.includes(group) ? 'bg-teal-50 border-teal-300 text-teal-800' : 'bg-white border-slate-200 text-slate-600 hover:border-teal-200'}`}>\n                                            <input \n                                                type=\"checkbox\" \n                                                checked={selectedGroups.includes(group)}\n                                                onChange={() => toggleGroupSelection(group)}\n                                                className=\"hidden\"\n                                            />\n                                            {group}\n                                        </label>\n                                    ))}\n                                </div>\n                            )}\n                            <div className=\"pt-2\">\n                                <p className=\"text-sm font-medium text-teal-700 flex items-center gap-2\">\n                                    This message will be sent to {matchedGroupUsers.length} investor{matchedGroupUsers.length !== 1 ? 's' : ''}.\n                                </p>\n                            </div>\n                        </div>\n                    )}\n\n                    {/* Individual Targeting */}"
    )
]

patch_file('./src/components/AdminAnnouncements.tsx', ann_reps)

# ADMIN UPLOAD
up_reps = [
    (
        "    const [audience, setAudience] = useState('all');\n    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);\n    const [usersList, setUsersList] = useState<UserProfile[]>([]);",
        "    const [audience, setAudience] = useState('all');\n    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);\n    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);\n    const [usersList, setUsersList] = useState<UserProfile[]>([]);"
    ),
    (
        "    const handleUserToggle = (uid: string) => {\n        setSelectedUsers(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]);\n    };",
        "    const uniqueGroups = Array.from(new Set(usersList.flatMap(u => u.groups || []))).sort();\n\n    const handleUserToggle = (uid: string) => {\n        setSelectedUsers(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]);\n    };\n\n    const handleGroupToggle = (group: string) => {\n        setSelectedGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]);\n    };"
    ),
    (
        "                                target_audience: audience,\n                                allowed_uids: audience === 'all' ? [] : selectedUsers,",
        "                                target_audience: audience,\n                                allowed_uids: audience === 'all' \n                                    ? [] \n                                    : audience === 'groups'\n                                        ? usersList.filter(u => u.groups?.some(g => selectedGroups.includes(g))).map(u => u.uid)\n                                        : selectedUsers,"
    ),
    (
        "                            const targetedUsers = audience === 'all' \n                                ? usersList \n                                : usersList.filter(u => selectedUsers.includes(u.uid));",
        "                            const targetedUsers = audience === 'all' \n                                ? usersList \n                                : audience === 'groups'\n                                    ? usersList.filter(u => u.groups?.some(g => selectedGroups.includes(g)))\n                                    : usersList.filter(u => selectedUsers.includes(u.uid));"
    ),
    (
        "            setFiles([]); \n            setTitle(''); \n            setSelectedUsers([]);",
        "            setFiles([]); \n            setTitle(''); \n            setSelectedUsers([]);\n            setSelectedGroups([]);"
    ),
    (
        "                    <div className=\"flex gap-4\">\n                        {['all', 'specific_users'].map(opt => (\n                            <label key={opt} className={`flex items-center gap-2.5 cursor-pointer px-4 py-3 rounded-lg border flex-1 transition-all ${audience === opt ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-teal-200'}`}>\n                                <input type=\"radio\" name=\"audience\" value={opt} checked={audience === opt} onChange={() => setAudience(opt)} className=\"text-teal-600 focus:ring-teal-500\" />\n                                <div>\n                                    <p className={`text-sm font-medium ${audience === opt ? 'text-teal-800' : 'text-slate-600'}`}>\n                                        {opt === 'all' ? 'All Investors' : 'Specific Investors'}\n                                    </p>\n                                    <p className=\"text-xs text-slate-400 font-light\">\n                                        {opt === 'all' ? 'Visible to everyone' : 'Choose recipients below'}\n                                    </p>\n                                </div>\n                            </label>\n                        ))}\n                    </div>\n\n                    {audience === 'specific_users' && (",
        "                    <div className=\"flex flex-col sm:flex-row gap-4\">\n                        {['all', 'groups', 'specific_users'].map(opt => (\n                            <label key={opt} className={`flex items-center gap-2.5 cursor-pointer px-4 py-3 rounded-lg border flex-1 transition-all ${audience === opt ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-teal-200'}`}>\n                                <input type=\"radio\" name=\"audience\" value={opt} checked={audience === opt} onChange={() => setAudience(opt)} className=\"text-teal-600 focus:ring-teal-500\" />\n                                <div>\n                                    <p className={`text-sm font-medium ${audience === opt ? 'text-teal-800' : 'text-slate-600'}`}>\n                                        {opt === 'all' && 'All Investors'}\n                                        {opt === 'groups' && 'Specific Groups'}\n                                        {opt === 'specific_users' && 'Specific Investors'}\n                                    </p>\n                                    <p className=\"text-xs text-slate-400 font-light\">\n                                        {opt === 'all' && 'Visible to everyone'}\n                                        {opt === 'groups' && 'Target custom groups'}\n                                        {opt === 'specific_users' && 'Choose individuals'}\n                                    </p>\n                                </div>\n                            </label>\n                        ))}\n                    </div>\n\n                    {audience === 'groups' && (\n                        <div className=\"mt-3 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-5\">\n                            <label className=\"text-xs text-slate-500 uppercase tracking-wider font-medium block mb-3\">Select Groups</label>\n                            {uniqueGroups.length === 0 ? (\n                                <p className=\"text-sm text-slate-500 italic\">No groups exist yet.</p>\n                            ) : (\n                                <div className=\"flex flex-wrap gap-2 mb-4\">\n                                    {uniqueGroups.map(group => (\n                                        <label key={group} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors text-sm font-medium ${selectedGroups.includes(group) ? 'bg-teal-50 border-teal-300 text-teal-800' : 'bg-white border-slate-200 text-slate-600 hover:border-teal-200'}`}>\n                                            <input \n                                                type=\"checkbox\" \n                                                checked={selectedGroups.includes(group)}\n                                                onChange={() => handleGroupToggle(group)}\n                                                className=\"hidden\"\n                                            />\n                                            {group}\n                                        </label>\n                                    ))}\n                                </div>\n                            )}\n                            <p className=\"text-sm font-medium text-teal-700\">\n                                This document will be visible to {usersList.filter(u => u.groups?.some(g => selectedGroups.includes(g))).length} investor(s).\n                            </p>\n                        </div>\n                    )}\n\n                    {audience === 'specific_users' && ("
    )
]

patch_file('./src/components/AdminDocumentUpload.tsx', up_reps)

print("Done")
