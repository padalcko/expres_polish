#!/usr/bin/env python3
"""Check generated AI resources, source coverage, discovery and local link targets."""
import sys
sys.dont_write_bytecode=True
import json,re
from urllib.parse import urlsplit, unquote
from ai_resources import ROOT, BASE, Parser, discover, outputs, excluded, md_path

def normalized(s):
    s=re.sub(r'\[([^\]]*)\]\([^)]*\)',r'\1',s)
    return re.sub(r'[\s*#_|\[\]`\\]+','',s)

def plain(n):
    if excluded(n):return ''
    return n.data+''.join(plain(c) for c in n.children)

def visible(n):
    while n:
        if excluded(n):return False
        n=n.parent
    return True

def main():
    expected=outputs();pages=discover();checked=0;links=0
    for name,content in expected.items():
        assert (ROOT/name).exists() and (ROOT/name).read_text()==content, 'Stale: '+name
    catalog=json.loads((ROOT/'ai-catalog.json').read_text())
    assert {p['url'] for p in catalog['pages']}=={p['canonical'] for p in pages}
    for p in pages:
        md=(ROOT/md_path(p['path'])).read_text();text=normalized(md)
        for n in p['main'].all():
            if n.tag in ('h1','h2','h3','h4','p','li','td','th','summary') and visible(n):
                value=normalized(plain(n))
                assert not value or value in text, f'Missing source text: {p["path"]}: {plain(n)[:100]}'
                checked+=1
        discovery=[n for n in p['tags'] if n.tag=='link' and n.attrs.get('type')=='text/markdown']
        assert len(discovery)==1 and discovery[0].attrs['href']=='/'+md_path(p['path']).as_posix(), p['path']
        for n in p['tags']:
            if n.tag=='link' and n.attrs.get('rel')=='describedby':assert (ROOT/n.attrs['href'].lstrip('/')).exists()
    for name,content in expected.items():
        if not name.endswith(('.md','.txt')):continue
        for url in re.findall(r'\]\((https://expres-polish\.pl/[^\s)]*)\)',content):
            u=urlsplit(url);rel=unquote(u.path).lstrip('/');target=ROOT/rel
            if target.is_dir():target=target/'index.html'
            assert target.exists(), f'{name}: missing {url}'
            if u.fragment and target.suffix=='.html':
                ids={n.attrs.get('id') for n in Parser(target.read_text()).root.all()}
                assert unquote(u.fragment) in ids, f'{name}: missing anchor {url}'
            links+=1
    candidates=list(ROOT.glob('*.md'))+list((ROOT/'ru').glob('*.md'))+list((ROOT/'ai').glob('*.md'))
    for path in candidates:
        content=path.read_text()
        if 'Language versions:' in content:
            assert path.relative_to(ROOT).as_posix() in expected, 'Orphan generated resource: '+str(path)
    sitemap=(ROOT/'sitemap.xml').read_text()
    assert '.md<' not in sitemap and 'llms' not in sitemap and 'ai-catalog' not in sitemap
    print(f'PASS: {len(pages)} canonical HTML/Markdown pairs; {checked} source blocks; {links} local links; catalog, discovery, freshness and sitemap.')
if __name__=='__main__':main()
