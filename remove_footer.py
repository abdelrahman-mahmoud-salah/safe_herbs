import os
import re

css_dir = r"c:\Users\-Vip-23\Desktop\safe-herbs-portfolio\css"
files = os.listdir(css_dir)

# the selectors to remove
selectors = [
    r"footer",
    r"\.footer-inner",
    r"\.footer-logo",
    r"\.footer-logo\s+span",
    r"\.footer-brand\s+p",
    r"\.footer-col\s+h4",
    r"\.footer-col\s+a",
    r"\.footer-col\s+a:hover",
    r"\.footer-bottom"
]

for filename in files:
    if not filename.endswith(".css") or filename == "footer.css":
        continue

    filepath = os.path.join(css_dir, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original_content = content

    for sel in selectors:
        # Match selector followed by { ... }
        # Need to handle potential multiple declarations like: selector { ... }
        # Using a regex that matches `sel` then optionally some whitespace/newlines, then `{` up to the next `}`.
        # Note: this won't work well if there are nested braces, but standard CSS doesn't have nested braces.
        pattern = re.compile(r'(?m)^\s*' + sel + r'\s*\{[^}]*\}')
        content = pattern.sub('', content)

    # also remove /* ── FOOTER ── */
    content = re.sub(r'/\*.*FOOTER.*\*/', '', content)

    if content != original_content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Cleaned {filename}")
    else:
        print(f"No changes in {filename}")
