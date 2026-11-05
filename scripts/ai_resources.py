"""AI resource generation from canonical Expres Polish HTML; standard library only."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit, quote
from html import escape
import re, json, hashlib
import xml.etree.ElementTree as ET
ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://expres-polish.pl'
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())
BEGIN, END = '<!-- AI resources: generated -->', '<!-- /AI resources -->'
class Node:
    def __init__(self, tag='', attrs=(), parent=None, data=''):
        self.tag, self.attrs, self.parent, self.data = tag, dict(attrs), parent, data
        self.children = []
    def all(self, tag=None):
        for child in self.children:
            if tag is None or child.tag == tag:
                yield child
            yield from child.all(tag)
    def text(self):
        return re.sub(r'\s+', ' ', self.data + ''.join(c.text_raw() for c in self.children)).strip()
    def text_raw(self):
        return self.data + ''.join(c.text_raw() for c in self.children)
    def has(self, cls):
        return cls in self.attrs.get('class', '').split()

class Parser(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.root = Node(); self.current = self.root
        self.feed(source)
    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.current)
        self.current.children.append(node)
        if tag not in VOID:
            self.current = node
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)
    def handle_endtag(self, tag):
        node = self.current
        while node.parent:
            if node.tag == tag:
                self.current = node.parent; return
            node = node.parent
    def handle_data(self, data):
        self.current.children.append(Node(parent=self.current, data=data))

def absolute(value, canonical):
    return quote(urljoin(canonical, value), safe=':/?#&=%+@,;~!$\'*-._')

def strip_integration(source):
    return re.sub(re.escape(BEGIN)+r'.*?'+re.escape(END)+r'\n?', '', source, flags=re.S)

def md_path(path):
    return path.with_suffix('.md')

def integrate(source, path):
    source = strip_integration(source)
    md = '/' + md_path(Path(path)).as_posix()
    block = (BEGIN + '\n' + f'<link rel="alternate" type="text/markdown" href="{md}">\n'
             '<link rel="describedby" href="/llms.txt">\n'
             '<link rel="describedby" type="application/json" href="/ai-catalog.json">\n' + END + '\n')
    return source.replace('</head>', block+'</head>', 1)

def discover():
    urls = [n.text for n in ET.parse(ROOT/'sitemap.xml').findall('{*}url/{*}loc')]
    assert len(urls) == len(set(urls)), 'Duplicate sitemap URL'
    pages = []
    for url in sorted(urls):
        assert url.startswith(BASE+'/'), url
        rel = urlsplit(url).path.lstrip('/')
        path = Path(rel+'index.html' if not rel or rel.endswith('/') else rel)
        assert path.suffix == '.html' and '..' not in path.parts, path
        source = (ROOT/path).read_text()
        tags = list(Parser(source).root.all())
        meta = {n.attrs.get('name',n.attrs.get('property')):n.attrs.get('content','') for n in tags if n.tag=='meta'}
        assert 'noindex' not in meta.get('robots',''), path
        assert [n.attrs.get('href') for n in tags if n.tag=='link' and n.attrs.get('rel')=='canonical']==[url], path
        h1 = [n for n in tags if n.tag=='h1']; assert len(h1)==1, path
        main = [n for n in tags if n.tag=='main']; assert len(main)==1, path
        lang = next(n.attrs['lang'] for n in tags if n.tag=='html'); assert lang in ('uk','ru'), path
        alternates = {n.attrs['hreflang']:n.attrs['href'] for n in tags if n.tag=='link' and n.attrs.get('hreflang')}
        schemas = [json.loads(n.text_raw()) for n in tags if n.tag=='script' and n.attrs.get('type')=='application/ld+json']
        pages.append(dict(path=path,canonical=url,source=source,main=main[0],tags=tags,title=h1[0].text(),lang=lang,meta=meta,alternates=alternates,schemas=schemas,md=BASE+'/'+md_path(path).as_posix()))
    lookup={p['canonical']:p for p in pages}
    for p in pages:
        assert set(p['alternates'])=={'uk','ru','x-default'}, p['path']
        for lang in ('uk','ru'):
            peer=lookup[p['alternates'][lang]]
            assert peer['lang']==lang and peer['alternates'][p['lang']]==p['canonical'], p['path']
        assert p['alternates']['x-default']==p['alternates']['uk'], p['path']
    return pages

SKIP = {'script','style','nav','footer','noscript','form','input','select','textarea','button','svg','iframe'}
SKIP_CLASSES = {'modal','learning-widget','blog-back','blog-category','blog-badge','blog-breadcrumbs','social-tab','ai-chat'}
def excluded(n):
    return n.tag in SKIP or bool(set(n.attrs.get('class','').split()) & SKIP_CLASSES) or n.attrs.get('aria-hidden')=='true' or 'hidden' in n.attrs

def render(n,p):
    if excluded(n) or n.tag=='h1':return ''
    if not n.tag:return re.sub(r'\s+',' ',n.data)
    if n.tag=='img':return ''
    if n.tag=='table':
        rows=[]
        for row in n.all('tr'):
            cells=[clean(''.join(render(c,p) for c in cell.children)).replace('\n','<br>').replace('|',r'\|') for cell in row.children if cell.tag in ('td','th')]
            if cells:rows.append(cells)
        if not rows:return ''
        return '\n\n'+'\n'.join(['| '+' | '.join(rows[0])+' |','| '+' | '.join(['---']*len(rows[0]))+' |']+['| '+' | '.join(row)+' |' for row in rows[1:]])+'\n\n'
    body=''.join(render(c,p) for c in n.children)
    if n.tag=='a':
        href=n.attrs.get('href',''); label=clean(body)
        if not href or href=='#' or not label:return body
        return '['+label+']('+absolute(href,p['canonical'])+')'
    if n.tag in ('h2','h3','h4','h5','h6'):return '\n\n'+'#'*int(n.tag[1])+' '+clean(body)+'\n\n'
    if n.tag in ('strong','b'):return '**'+body.strip()+'**' if body.strip() else ''
    if n.tag in ('em','i'):return '*'+body.strip()+'*' if body.strip() else ''
    if n.tag=='li':return '\n- '+body.strip()+'\n'
    if n.tag=='ol':return '\n\n'+'\n'.join(str(i)+'. '+clean(''.join(render(c,p) for c in child.children)) for i,child in enumerate((c for c in n.children if c.tag=='li'),1))+'\n\n'
    if n.tag=='br':return '\n'
    if n.tag in ('p','div','section','header','main','article','figure','figcaption','address','details','summary','dl','dt','dd','ul'):
        return '\n\n'+body.strip()+'\n\n' if body.strip() else ''
    return body

def clean(s):
    return re.sub(r'\n{3,}','\n\n',re.sub(r'[ \t]*\n[ \t]*','\n',s)).strip()

def markdown(p):
    label='Джерело HTML' if p['lang']=='uk' else 'Источник HTML'
    out=f'# {p["title"]}\n\n{label}: {p["canonical"]}\n\nLanguage: {p["lang"]}\n\n'
    out+='Language versions: '+', '.join(f'[{lang}]({url})' for lang,url in p['alternates'].items() if lang!='x-default')+'\n\n'
    out+='> '+p['meta'].get('description','')+'\n\n'
    return out+clean(render(p['main'],p))+'\n'

def outputs():
    pages=discover(); out={}; catalog=[]
    for p in pages:
        md=markdown(p);out[md_path(p['path']).as_posix()]=md
        out[p['path'].as_posix()]=integrate(p['source'],p['path'])
        catalog.append({'url':p['canonical'],'markdown':p['md'],'language':p['lang'],'title':p['title'],'description':p['meta'].get('description',''),'alternates':p['alternates'],'content_sha256':hashlib.sha256(md.encode()).hexdigest()})
    llms='# Expres Polish\n\n> Polish language school in Wrocław and online. Website languages: Ukrainian and Russian.\n\nCanonical HTML pages are the source of truth. Markdown preserves their language and public text; navigation, forms and interactive controls are omitted. Course enrolment is not exam registration.\n\n'
    for lang,label in [('uk','Українською'),('ru','На русском')]:
        llms+='## '+label+'\n\n'
        for p in pages:
            if p['lang']==lang:llms+=f'- [{p["title"]}]({p["md"]}): {p["meta"].get("description", "")}\n'
        llms+='\n'
    llms+='## Resources\n\n- [Full text](https://expres-polish.pl/llms-full.txt)\n- [JSON catalog](https://expres-polish.pl/ai-catalog.json)\n- [HTML sitemap](https://expres-polish.pl/sitemap.xml)\n'
    out['llms.txt']=llms
    out['llms-full.txt']='# Expres Polish — full text\n\nGenerated from canonical HTML. Each section identifies its source and language.\n\n'+'\n---\n\n'.join(out[md_path(p['path']).as_posix()] for p in pages)
    out['ai-catalog.json']=json.dumps({'site':BASE,'name':'Expres Polish','languages':['uk','ru'],'source':BASE+'/sitemap.xml','pages':catalog},ensure_ascii=False,indent=2)+'\n'
    # Preserve existing resource URLs, replacing manually maintained summaries with source-derived text.
    aliases={'exams':['ispyty.html','ru/ekzameny.html'],'b1-exam':['derzhavnyi-ispyt-b1.html','ru/gosudarstvennyj-ekzamen-b1.html'],'telc-exam':['telc-polskyi.html','ru/telc-polskij.html']}
    for name,paths in aliases.items():out['ai/'+name+'.md']='\n---\n\n'.join(out[md_path(Path(path)).as_posix()] for path in paths)
    start,end='# BEGIN GENERATED AI HEADERS','# END GENERATED AI HEADERS'
    old=(ROOT/'_headers').read_text() if (ROOT/'_headers').exists() else ''
    old=re.sub(re.escape(start)+'.*?'+re.escape(end)+r'\n?','',old,flags=re.S).rstrip()
    headers=start+'\n'
    canon={md_path(p['path']).as_posix():p['canonical'] for p in pages}
    for name in sorted(n for n in out if n.endswith('.md') or n in ('llms.txt','llms-full.txt','ai-catalog.json')):
        mime='application/json' if name.endswith('.json') else 'text/markdown' if name.endswith('.md') else 'text/plain'
        headers+=f'/{name}\n  Content-Type: {mime}; charset=utf-8\n  X-Content-Type-Options: nosniff\n'
        if name in canon:headers+=f'  Link: <{canon[name]}>; rel="canonical", <{BASE}/llms.txt>; rel="describedby"\n'
        headers+='\n'
    out['_headers']=(old+'\n\n' if old else '')+headers+end+'\n'
    return out
