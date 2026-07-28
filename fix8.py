import os

def run_patches():
    with open('./src/pages/LandingPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    old_str = "'A forward-thinking media house dedicated to producing high-quality, impactful content across various digital platforms.'"
    new_str = "'Stop losing customers to businesses with bigger marketing budgets. Reelcraft delivers agency-quality video ads and social content, powered by AI and built around your brand.'"
    
    content = content.replace(old_str, new_str)
    
    with open('./src/pages/LandingPage2.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

run_patches()
print("Done")
