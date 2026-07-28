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

old_str = "name: 'Ronak Studios'"
new_str = "name: 'Reelcraft Media'"

def run_patches():
    with open('./src/pages/LandingPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace(old_str, new_str)
    
    with open('./src/pages/LandingPage2.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

run_patches()
print("Done")
