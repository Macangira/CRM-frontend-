import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Backgrounds
    content = re.sub(r'\bbg-zinc-950\b', 'bg-background', content)
    content = re.sub(r'\bbg-black\b', 'bg-background', content)
    
    # Surfaces
    content = re.sub(r'\bbg-zinc-900/90\b', 'bg-surface/90', content)
    content = re.sub(r'\bbg-zinc-900/50\b', 'bg-surface/50', content)
    content = re.sub(r'\bbg-zinc-900/20\b', 'bg-surface/20', content)
    content = re.sub(r'\bbg-zinc-900\b', 'bg-surface', content)
    
    # Cards
    content = re.sub(r'\bbg-zinc-800/80\b', 'bg-card/80', content)
    content = re.sub(r'\bbg-zinc-800/60\b', 'bg-hover', content)
    content = re.sub(r'\bbg-zinc-800/50\b', 'bg-hover', content)
    content = re.sub(r'\bbg-zinc-800/40\b', 'bg-hover', content)
    content = re.sub(r'\bbg-zinc-800\b', 'bg-card', content)
    
    # Borders
    content = re.sub(r'\bborder-zinc-900\b', 'border-border', content)
    content = re.sub(r'\bborder-zinc-800/80\b', 'border-border/80', content)
    content = re.sub(r'\bborder-zinc-800/60\b', 'border-border/60', content)
    content = re.sub(r'\bborder-zinc-800/50\b', 'border-border/50', content)
    content = re.sub(r'\bborder-zinc-800\b', 'border-border', content)
    content = re.sub(r'\bborder-zinc-700/60\b', 'border-border/60', content)
    content = re.sub(r'\bborder-zinc-700/50\b', 'border-border/50', content)
    content = re.sub(r'\bborder-zinc-700\b', 'border-border', content)
    
    # Text Primary
    content = re.sub(r'\btext-white\b', 'text-primary', content)
    content = re.sub(r'\btext-zinc-100\b', 'text-primary', content)
    content = re.sub(r'\btext-zinc-200\b', 'text-primary', content)
    content = re.sub(r'\btext-zinc-300\b', 'text-secondary', content)
    
    # Text Secondary & Muted
    content = re.sub(r'\btext-zinc-400\b', 'text-secondary', content)
    content = re.sub(r'\btext-zinc-500\b', 'text-muted', content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

def main():
    src_dir = 'src'
    for root, _, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
