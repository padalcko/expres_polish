#!/usr/bin/env python3
"""Validate blog HTML, locale pairs, internal targets, sitemap and preserved chrome."""
import importlib.util,json,re,subprocess,sys
sys.dont_write_bytecode=True
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit,unquote
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('blog',ROOT/'scripts/build-blog.py');blog=importlib.util.module_from_spec(spec);spec.loader.exec_module(blog)
class Page(HTMLParser):
 def __init__(self,s):
  super().__init__(convert_charrefs=True);self.tags=[];self.feed(s)
 def handle_starttag(self,tag,attrs):self.tags.append((tag,dict(attrs)))
errors=[]
def check(ok,msg):
 if not ok:errors.append(msg)
for name,expected in blog.outputs().items():
 p=ROOT/name;s=p.read_text();check(s==expected,name+': stale')
 if not name.endswith('.html'):continue
 parsed=Page(s); tags=parsed.tags; lang='ru' if name.startswith('ru/') else 'uk'
 check(sum(t=='h1' for t,a in tags)==1,name+': h1')
 check(sum(t=='main' for t,a in tags)==1,name+': main')
 for key in ['description','robots']:
  check(sum(t=='meta' and a.get('name')==key for t,a in tags)==1,name+': '+key)
 check(any(t=='link' and a.get('rel')=='canonical' and a.get('href')==blog.BASE+'/'+name for t,a in tags),name+': canonical')
 ids=[a['id'] for t,a in tags if 'id' in a];check(len(ids)==len(set(ids)),name+': duplicate ids')
 for t,a in tags:
  if t=='link' and a.get('hreflang') in ['uk','ru']:
   target=ROOT/urlsplit(a['href']).path.lstrip('/');check(target.exists(),name+': alternate absent')
   check(f'hreflang="{lang}" href="{blog.BASE}/{name}"' in target.read_text(),name+': hreflang reciprocity')
  for attr in ['href','src']:
   if attr not in a:continue
   u=urlsplit(a[attr])
   if u.scheme or u.netloc:continue
   target=ROOT/unquote(u.path).lstrip('/') if u.path.startswith('/') else p.parent/unquote(u.path) if u.path else p
   if target.is_dir():target=target/'index.html'
   check(target.exists(),name+': broken '+a[attr])
   if target.exists() and u.fragment and target.suffix=='.html':
    check(any(at.get('id')==u.fragment for _,at in Page(target.read_text()).tags),name+': missing anchor '+a[attr])
 main=s.split('<main',1)[1].split('</main>',1)[0]
 check('<img' not in main and '<svg' not in main,name+': decorative main image')
 for raw in re.findall(r'<script type="application/ld\+json">(.*?)</script>',s,re.S):
  d=json.loads(raw);check(d['@type'] in ['Blog','BlogPosting','BreadcrumbList'],name+': schema type')
  check(not any(k in d for k in ['image','author','datePublished','dateModified','aggregateRating']),name+': invented schema fields')
 source=(ROOT/blog.LOCALES[lang]['source']).read_text()
 for pattern in [r'<footer\b.*?</footer>',r'<aside class="social-tab".*?</aside>']:
  check(re.search(pattern,s,re.S)[0]==re.search(pattern,source,re.S)[0],name+': chrome changed')
 for a in re.findall(r'<div class="language-switcher".*?</div>',s,re.S):
  check(f'href="/{name}" lang="{lang}" aria-current="page"' in a,name+': language switch')
 if 'blog.html' not in name:
  check(len(re.sub('<[^>]+>',' ',main).split())>900,name+': article incomplete')
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls=[n.text for n in ET.parse(ROOT/'sitemap.xml').findall('s:url/s:loc',ns)]
check(len(urls)==len(set(urls)),'sitemap duplicate URLs')
for n in blog.outputs():
 if n.endswith('.html'):check(blog.BASE+'/'+n in urls,n+': absent in sitemap')
# Existing page changes must consist only of the requested two nav links.
for p in list(ROOT.glob('*.html'))+list((ROOT/'ru').glob('*.html')):
 if p.name.startswith('blog'):continue
 rel=p.relative_to(ROOT).as_posix();old=subprocess.check_output(['git','show','HEAD:'+rel],cwd=ROOT,text=True);new=p.read_text()
 stripped=re.sub(r'<a href="/(?:ru/)?blog.html">\s*Блог\s*</a>','',new)
 check(re.sub(r'\s+','',stripped)==re.sub(r'\s+','',old),rel+': unrelated changes')
 check(new.count('> Блог </a>')==2,rel+': missing blog navigation')
if errors:raise SystemExit('\n'.join(errors))
print('PASS: 6 pages; static content, metadata, schema, links, locale pairs, sitemap; existing pages only add blog navigation.')
