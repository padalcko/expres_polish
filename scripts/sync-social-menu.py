#!/usr/bin/env python3
"""Sync the static social menu from each language homepage; --check is CI-safe.
Run after adding a public HTML page. No browser JS or runtime request is needed.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
MENU = re.compile(r'<aside class="social-tab"[^>]*>.*?</aside>', re.S)
check = '--check' in sys.argv
sources = {lang: MENU.search((ROOT / file).read_text()).group() for lang, file in
           [('uk', 'index.html'), ('ru', 'ru/index.html')]}
issues = []
count = 0
for path in sorted(ROOT.rglob('*.html')):
    if any(part.startswith('.') or part in {'node_modules', 'docs'} for part in path.relative_to(ROOT).parts):
        continue
    original = path.read_text()
    if not re.search(r'<html\b', original, re.I):
        continue
    count += 1
    lang = re.search(r'<html\b[^>]*lang=["\']([^"\']+)', original)
    if not lang or lang[1] not in sources:
        issues.append(str(path.relative_to(ROOT)) + ': unsupported or missing language')
        continue
    component = sources[lang[1]]
    menus = list(MENU.finditer(original))
    if len(menus) > 1:
        issues.append(str(path.relative_to(ROOT)) + ': duplicate social menus')
        continue
    if menus:
        updated = MENU.sub(lambda _: component, original, count=1)
    else:
        updated = original.replace('</header>', '</header>\n\n    ' + component, 1)
    if 'has-social-menu' not in updated:
        def body(m):
            tag = m[0]
            if 'class="' in tag:
                return tag.replace('class="', 'class="has-social-menu ', 1)
            return tag[:-1] + ' class="has-social-menu">'
        updated = re.sub(r'<body\b[^>]*>', body, updated, count=1)
    if 'id="aiChat"' not in updated or updated.count('src="/scripts/script' + ('-ru' if lang[1] == 'ru' else '') + '.js"') != 1:
        issues.append(str(path.relative_to(ROOT)) + ': missing chat or duplicated/missing language script')
    if updated != original:
        if check:
            issues.append(str(path.relative_to(ROOT)) + ': social menu needs synchronization')
        else:
            path.write_text(updated)
            print('Updated', path.relative_to(ROOT))
if issues:
    print('\n'.join(issues))
    sys.exit(1)
print(f'{count} public pages: social menus synchronized')
