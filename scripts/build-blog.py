#!/usr/bin/env python3
"""Build static bilingual blog from HTML fragments and existing locale chrome.
Run python3 scripts/build-blog.py; --check verifies generated output freshness.
"""
from pathlib import Path
from html import escape
import json,re,sys
sys.dont_write_bytecode=True
from ai_resources import integrate, strip_integration
ROOT=Path(__file__).resolve().parents[1]
BASE='https://expres-polish.pl'
ARTICLES=[
 {'id': 'holidays', 'badges': {'uk': 'Побут', 'ru': 'Быт'}, 'published': '2026-11-05', 'uk': {'title': 'Польські свята очима українців: традиції, звичаї та особливості життя в Польщі', 'path': 'blog-polski-sviata-ta-tradytsii.html', 'seo': 'Польські свята та традиції | Що варто знати українцям у Польщі', 'description': 'Дізнайтеся про польські свята, Різдво, Великдень, День незалежності, majówkę та інші традиції. Корисні польські слова й поради від Expres Polish.', 'card': 'Польські свята, традиції та корисні фрази для повсякденного життя в Польщі.', 'category': 'Життя в Польщі'}, 'ru': {'title': 'Польские праздники глазами украинцев: традиции, обычаи и особенности жизни в Польше', 'path': 'ru/blog-polskie-prazdniki-i-tradicii.html', 'seo': 'Польские праздники и традиции | Что нужно знать в Польше', 'description': 'Узнайте о польских праздниках, Рождестве, Пасхе, Дне независимости, majówka и других традициях. Полезные польские фразы и советы от Expres Polish.', 'card': 'Польские праздники, традиции и полезные фразы для повседневной жизни в Польше.', 'category': 'Жизнь в Польше'}},
 {'id': 'introduction', 'badge': 'Тест', 'interactive': True, 'created': '2026-11-03', 'uk': {'title': 'Як розповісти про себе польською мовою: фрази, приклади та тест', 'path': 'blog-yak-rozpovisty-pro-sebe-polskoyu.html', 'seo': 'Як розповісти про себе польською мовою: фрази, приклади та тест | Expres Polish', 'description': 'Фрази та приклади самопрезентації польською, типові помилки, тест із 10 запитань і конструктор власної розповіді.', 'card': 'Фрази та приклади самопрезентації польською, типові помилки, тест із 10 запитань і конструктор власної розповіді.', 'category': 'Вивчення мови'}, 'ru': {'title': 'Как рассказать о себе на польском языке: фразы, примеры и тест', 'path': 'ru/blog-kak-rasskazat-o-sebe-na-polskom.html', 'seo': 'Как рассказать о себе на польском языке: фразы, примеры и тест | Expres Polish', 'description': 'Фразы и примеры самопрезентации на польском, типичные ошибки, тест из 10 вопросов и конструктор собственного рассказа.', 'card': 'Фразы и примеры самопрезентации на польском, типичные ошибки, тест из 10 вопросов и конструктор собственного рассказа.', 'category': 'Изучение языка'}},
 {'id': 'films', 'badge': '🔥🔥🔥', 'modified': '2026-10-28', 'ru': {'path': 'ru/blog-polskie-filmy-i-serialy-dlya-izucheniya-yazyka.html', 'title': 'Какие польские фильмы и сериалы смотреть, чтобы быстрее выучить польский язык', 'seo': 'Польские фильмы и сериалы для изучения языка | Expres Polish', 'description': 'Какие фильмы и сериалы помогут выучить польский язык? Подборка для уровней A1, A2 и B1, советы по просмотру и изучению польского с Expres Polish.', 'card': 'Фильмы и сериалы для уровней A1, A2 и B1, советы по просмотру с субтитрами.', 'category': 'Изучение языка'}, 'uk': {'path': 'blog-polski-filmy-ta-serialy-dlya-vyvchennya-movy.html', 'title': 'Які польські фільми та серіали дивитися, щоб швидше вивчити польську мову', 'seo': 'Польські фільми та серіали для вивчення мови | Expres Polish', 'description': 'Які польські фільми та серіали допоможуть вивчити мову? Добірка для рівнів A1, A2 і B1, поради щодо перегляду та навчання від Expres Polish.', 'card': 'Фільми та серіали для рівнів A1, A2 і B1, поради щодо перегляду із субтитрами.', 'category': 'Вивчення мови'}},
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
 head=strip_integration(source).split('<head>',1)[1].split('</head>',1)[0]
 head=re.sub(r'(?m)^[ \t]+$', '', head)
 head=head.rstrip()
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
 if item and item.get('modified'):
  schema['dateModified']=item['modified']
  for k,v in {'card':'summary','title':data['seo'],'description':desc}.items():head+=f'<meta name="twitter:{k}" content="{escape(v,quote=True)}">\n'
 if item and item.get("created"):
  schema["dateCreated"]=item["created"]
  for k,v in {"card":"summary","title":data["seo"],"description":desc}.items():head+=f'<meta name="twitter:{k}" content="{escape(v,quote=True)}">\n'
 if item and item.get('published'):
  schema['datePublished']=item['published']
  head+=f'<meta property="article:published_time" content="{item["published"]}">\n'
  for k,v in {'card':'summary','title':data['seo'],'description':desc}.items():head+=f'<meta name="twitter:{k}" content="{escape(v,quote=True)}">\n'
 if item and item.get("interactive"):
  head+='<link rel="stylesheet" href="/styles/learning-widgets.css">\n<script type="module" src="/scripts/introduction.js"></script>\n'
 head+=ld(schema)
 chrome=source.split('<body',1)[1].split('>',1)[1].split('<main>',1)[0]
 gtm_match=re.match(r'\s*(<!-- Google Tag Manager \(noscript\) -->.*?<!-- End Google Tag Manager \(noscript\) -->)\s*',chrome,re.S)
 if not gtm_match:
  raise ValueError(f'GTM noscript snippet missing from {cfg["source"]}')
 gtm_noscript=gtm_match.group(1)
 chrome=chrome[gtm_match.end():]
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
  updated=('<p>'+('Оновлено' if lang=='uk' else 'Обновлено')+': <time datetime="'+item['modified']+'">28.10.2026</time></p>') if item.get('modified') else ''
  if item.get('published'):
   date=item['published']; display='.'.join(reversed(date.split('-')))
   updated='<p>'+('Опубліковано' if lang=='uk' else 'Опубликовано')+f': <time datetime="{date}">{display}</time></p>'
  main=f'<div class="container"><div class="blog-reading">{breadcrumb}<article><header class="blog-intro"><p class="blog-category">{data["category"]}</p><h1>{escape(title)}</h1>{updated}</header><div class="blog-prose">{body}</div></article><p class="blog-back"><a href="/{cfg["index"]}">{cfg["back"]}</a></p></div></div>'
 else:
  cards=''
  for a in ARTICLES:
   d=a[lang];badge=a.get("badges", {}).get(lang, a.get("badge", "Важливо" if lang=="uk" else "Важно"));cards+=f'<article class="card blog-card"><div class="blog-card-top"><p class="blog-category">{d["category"]}</p><span class="blog-badge">{badge}</span></div><h2><a href="/{d["path"]}">{escape(d["title"])}</a></h2><p class="blog-card-description">{d["card"]}</p><a class="blog-read" href="/{d["path"]}" aria-label="{escape(cfg["read"]+": "+d["title"],quote=True)}">{cfg["read"]}</a></article>\n'
  main=f'<div class="container">{breadcrumb}<header class="blog-intro"><h1>{title}</h1><p>{desc}</p></header><div class="cards blog-grid">{cards}</div></div>'
 return integrate('<!doctype html>\n<html lang="'+lang+'">\n<head>'+head+'</head>\n<body id="top" class="has-social-menu blog-page">\n'+gtm_noscript+'\n<a class="blog-skip" href="#blog-main">'+cfg['skip']+'</a>'+chrome+'<main id="blog-main" class="blog-main">'+main+'</main>'+tail, path)

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
 print('Blog: '+('fresh' if '--check' in sys.argv else 'generated')+f' ({len(LOCALES)*(1+len(ARTICLES))} pages + sitemap)')
