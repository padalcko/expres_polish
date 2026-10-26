#!/usr/bin/env python3
"""Build static bilingual blog from HTML fragments and existing locale chrome.
Run python3 scripts/build-blog.py; --check verifies generated output freshness.
"""
from pathlib import Path
from html import escape
import json,re,sys
ROOT=Path(__file__).resolve().parents[1]
BASE='https://expres-polish.pl'
ARTICLES=[
 {'id':'b1','uk':{'path':'blog-pidhotovka-do-b1.html','title':'Як підготуватися до державного іспиту з польської мови B1: повний посібник','seo':'Підготовка до державного B1: план і поради | Expres Polish','description':'Як готуватися до державного B1 з польської: структура, оцінювання, робота з п’ятьма навичками та адаптивний план на 10 тижнів.','card':'П’ять навичок і план підготовки на 10 тижнів.','category':'Підготовка до B1'},
 'ru':{'path':'ru/blog-podgotovka-k-b1.html','title':'Как подготовиться к государственному экзамену по польскому языку B1: полное руководство','seo':'Подготовка к государственному B1: план и советы | Expres Polish','description':'Подготовка к государственному B1 по польскому: структура экзамена, оценивание, пять навыков и практический план занятий на 10 недель.','card':'Пять навыков и план подготовки на 10 недель.','category':'Подготовка к B1'}},
 {'id':'compare','uk':{'path':'blog-b1-chy-telc-2026.html','title':'Державний іспит B1 чи TELC у 2026 році: у чому різниця та який сертифікат обрати','seo':'Державний B1 чи TELC у 2026: порівняння | Expres Polish','description':'Порівняння державного B1 і польського TELC: формат, визнання для громадянства, резидентства та навчання, оплата й строки результатів.','card':'Формат іспитів і визнання сертифікатів у 2026 році.','category':'Вибір сертифіката'},
 'ru':{'path':'ru/blog-b1-ili-telc-2026.html','title':'Государственный экзамен B1 или TELC в 2026 году: в чём разница и какой сертификат выбрать','seo':'Государственный B1 или TELC в 2026: сравнение | Expres Polish','description':'Государственный B1 и польский TELC: формат, признание для гражданства, резидентства и учёбы, стоимость и ожидание результатов.','card':'Формат экзаменов и признание сертификатов в 2026 году.','category':'Выбор сертификата'}}]
LOCALES={
 'uk':{'source':'ispyty.html','index':'blog.html','title':'Блог школи польської мови','description':'Корисні матеріали про вивчення польської мови, підготовку до іспитів B1 і TELC, сертифікацію та практичне використання польської мови.','home':'Головна','root':'/','crumb':'Навігаційний шлях','read':'Читати статтю','back':'Повернутися до блогу','skip':'Перейти до змісту'},
 'ru':{'source':'ru/ekzameny.html','index':'ru/blog.html','title':'Блог школы польского языка','description':'Полезные материалы об изучении польского языка, подготовке к экзаменам B1 и TELC, сертификации и практическом использовании польского языка.','home':'Главная','root':'/ru/','crumb':'Навигационный путь','read':'Читать статью','back':'Вернуться в блог','skip':'Перейти к содержанию'}}
def ld(data):return '<script type="application/ld+json">'+json.dumps({'@context':'https://schema.org',**data},ensure_ascii=False,indent=2)+'</script>'
def render(lang, item=None):
 cfg=LOCALES[lang]; source=(ROOT/cfg['source']).read_text()
 data=item[lang] if item else {'path':cfg['index'],'title':cfg['title'],'seo':cfg['title']+' | Expres Polish','description':cfg['description']}
 path=data['path']; title=data['title']; desc=data['description']; url=BASE+'/'+path
 pairs={l:BASE+'/'+(item[l]['path'] if item else LOCALES[l]['index']) for l in LOCALES}
 head=source.split('<head>',1)[1].split('</head>',1)[0]
 head=re.sub(r'<script type="application/ld\+json">.*?</script>','',head,flags=re.S)
 head=re.sub(r'<title>.*?</title>',lambda _: '<title>'+escape(data['seo'])+'</title>',head,flags=re.S)
 head=re.sub(r'<meta\b[^>]*(?:name="(?:description|author|twitter:[^"]+)"|property="og:[^"]+")[^>]*>','',head,flags=re.S)
 head=re.sub(r'<link\b[^>]*(?:rel="canonical"|hreflang=|href="/styles/exams.css")[^>]*>','',head,flags=re.S)
 head+='\n<meta name="description" content="'+escape(desc,quote=True)+'">\n<link rel="canonical" href="'+url+'">\n<link rel="stylesheet" href="/styles/blog.css">\n'
 for l,u in pairs.items():head+=f'<link rel="alternate" hreflang="{l}" href="{u}">\n'
 head+=f'<link rel="alternate" hreflang="x-default" href="{pairs["uk"]}">\n'
 for k,v in {'type':'article' if item else 'website','locale':'uk_UA' if lang=='uk' else 'ru_RU','locale:alternate':'ru_RU' if lang=='uk' else 'uk_UA','site_name':'Expres Polish','title':data['seo'],'description':desc,'url':url}.items():head+=f'<meta property="og:{k}" content="{escape(v,quote=True)}">\n'
 crumbs=[(cfg['home'],BASE+cfg['root']),('Блог',BASE+'/'+cfg['index'])]
 if item:crumbs.append((title,url))
 head+=ld({'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':i+1,'name':n,'item':u} for i,(n,u) in enumerate(crumbs)]})
 schema={'@type':'BlogPosting' if item else 'Blog','@id':url+'#'+('article' if item else 'blog'),'url':url,'name':title,'description':desc,'inLanguage':lang}
 if item:schema.update(headline=title,mainEntityOfPage=url,isPartOf={'@id':BASE+'/'+cfg['index']+'#blog'},articleSection=data['category'])
 else:schema['blogPost']=[{'@type':'BlogPosting','headline':a[lang]['title'],'url':BASE+'/'+a[lang]['path']} for a in ARTICLES]
 head+=ld(schema)
 chrome=source.split('<body',1)[1].split('>',1)[1].split('<main>',1)[0]
 chrome=re.sub(r'(<a href="/(?:ispyty|ru/ekzameny).html") aria-current="page"',r'\1',chrome)
 def switch(m):
  t=m[0]
  for l,u in pairs.items():t=re.sub(r'<a href="[^"]+" lang="'+l+r'"[^>]*>',f'<a href="{u.removeprefix(BASE)}" lang="{l}"'+(' aria-current="page"' if l==lang else '')+'>',t)
  return t
 chrome=re.sub(r'<div class="language-switcher".*?</div>',switch,chrome,flags=re.S)
 if not item:chrome=chrome.replace(f'<a href="/{cfg["index"]}">',f'<a href="/{cfg["index"]}" aria-current="page">')
 tail=source.split('</main>',1)[1]
 breadcrumb='<nav class="blog-breadcrumbs" aria-label="'+cfg['crumb']+'"><ol>'
 for i,(n,u) in enumerate(crumbs):breadcrumb+='<li>'+('<span aria-current="page">'+escape(n)+'</span>' if i==len(crumbs)-1 else '<a href="'+u.removeprefix(BASE)+'">'+n+'</a>')+'</li>'
 breadcrumb+='</ol></nav>'
 if item:
  body=(ROOT/'content/blog'/f'{item["id"]}-{lang}.html').read_text()
  main=f'<div class="container"><div class="blog-reading">{breadcrumb}<article><header class="blog-intro"><p class="blog-category">{data["category"]}</p><h1>{escape(title)}</h1></header><div class="blog-prose">{body}</div></article><p class="blog-back"><a href="/{cfg["index"]}">{cfg["back"]}</a></p></div></div>'
 else:
  cards=''
  for a in ARTICLES:
   d=a[lang];badge="Важливо" if lang=="uk" else "Важно";cards+=f'<article class="card blog-card"><div class="blog-card-top"><p class="blog-category">{d["category"]}</p><span class="blog-badge">{badge}</span></div><h2><a href="/{d["path"]}">{escape(d["title"])}</a></h2><p class="blog-card-description">{d["card"]}</p><a class="blog-read" href="/{d["path"]}" aria-label="{escape(cfg["read"]+": "+d["title"],quote=True)}">{cfg["read"]}</a></article>\n'
  main=f'<div class="container">{breadcrumb}<header class="blog-intro"><h1>{title}</h1><p>{desc}</p></header><div class="cards blog-grid">{cards}</div></div>'
 return '<!doctype html>\n<html lang="'+lang+'">\n<head>'+head+'</head>\n<body id="top" class="has-social-menu blog-page">\n<a class="blog-skip" href="#blog-main">'+cfg['skip']+'</a>'+chrome+'<main id="blog-main" class="blog-main">'+main+'</main>'+tail

def outputs():
 out={}
 for lang,cfg in LOCALES.items():
  out[cfg['index']]=render(lang)
  for a in ARTICLES:out[a[lang]['path']]=render(lang,a)
 sitemap=(ROOT/'sitemap.xml').read_text()
 sitemap=re.sub(r'\s*<!-- BLOG START -->.*?<!-- BLOG END -->','',sitemap,flags=re.S)
 block='\n  <!-- BLOG START -->\n'
 for a in [None]+ARTICLES:
  pairs={l:BASE+'/'+(a[l]['path'] if a else LOCALES[l]['index']) for l in LOCALES}
  for u in pairs.values():
   block+='  <url>\n    <loc>'+u+'</loc>\n'
   for l,v in {**pairs,'x-default':pairs['uk']}.items():block+=f'    <xhtml:link rel="alternate" hreflang="{l}" href="{v}" />\n'
   block+='  </url>\n'
 block+='  <!-- BLOG END -->\n'
 out['sitemap.xml']=sitemap.replace('</urlset>',block+'</urlset>')
 # Stable output on repeated builds.
 out['sitemap.xml']=re.sub(r'\n+  <!-- BLOG START -->','\n  <!-- BLOG START -->',out['sitemap.xml'])
 return out
if __name__=='__main__':
 stale=[]
 for name,html in outputs().items():
  p=ROOT/name
  if '--check' in sys.argv:
   if not p.exists() or p.read_text()!=html:stale.append(name)
  else:p.write_text(html)
 if stale:raise SystemExit('Stale: '+', '.join(stale))
 print('Blog: '+('fresh' if '--check' in sys.argv else 'generated')+' (6 pages + sitemap)')
