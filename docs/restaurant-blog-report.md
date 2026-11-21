# Стаття про ресторан: локальна інтеграція

Дата підготовки: 21.11.2026. Commit, push, deploy не виконано.

## Сторінки та аудіо
- https://expres-polish.pl/blog-yak-zamovyty-yizhu-polskoyu.html — /audio/restaurant-guide-uk.m4a (985.43 с).
- https://expres-polish.pl/ru/blog-kak-zakazat-edu-na-polskom.html — /audio/restaurant-guide-ru.m4a (1062.92 с).

Це підготовлені URL, доступність на production не перевірялася.
Оригінали скопійовано з Downloads без перекодування; SHA-256 копій збігаються з оригіналами. AAC, mono, 44.1 kHz у M4A; MIME audio/mp4 у source та правилі _headers.
Відповідність мовних файлів перевірена за наданими назвами та шляхами; прослуховування змісту й дослівна відповідність статті не перевірені.

Нативний audio controls preload="metadata", без autoplay, після п'яти вступних абзаців перед першим H2. Локалізовані назва, опис і доступне ім'я. Без бібліотек і зовнішніх хостингів.

## Статті, тести, дизайн
Усі рядки обох авторських текстів звірено з вкладенням. Використано чинний генератор, шаблон office та quiz-engine.js. По 10 питань, 3 варіанти, один правильний; ключі A B C A B C A B C A. Питання й пояснення взято з вкладення.
Збережено спільні Header, Footer, навігацію, Агнешку, соціальне меню й механізм мовного перемикача. CSS додано лише для нового аудіоблоку. Картки використовують чинний текстовий шаблон. Фото ресторану відсутнє: потрібен наданий файл із правами використання; сторонні зображення не підставлено.
Додано посилання на лікаря, ужонд і чинний розділ курсів.

## SEO / GEO / AI
Self canonical; взаємні uk/ru/x-default; lang, Open Graph, Twitter summary; BlogPosting, BreadcrumbList; один H1; sitemap, clean URL redirects, Markdown, llms.txt, llms-full.txt та ai-catalog.json.
Дата 21.11.2026 у published/updated відповідає даті підготовки; при пізнішому deploy її слід актуалізувати. AudioObject, FAQPage та Quiz schema не додано.

## Перевірки
- build-site.py та --check — PASS: 22 сторінки блогу; 75 AI-файлів.
- check-blog.py — PASS: контент, метадані, schema, посилання, мовні пари, sitemap; попередні статті не змінені.
- check-ai-search.py — PASS: 34 HTML/Markdown пари, 4124 блоки, 471 локальне посилання.
- sync-social-menu.py --check та git diff --check — PASS.
- Chrome: обидві мови на ширинах 320, 375, 430, 768, 1440 px, без горизонтального overflow.
- Chrome: обидва аудіо завантажують metadata, запускаються, час відтворення зростає; pause, seek до 60 с, volume=0.4, keyboard focus — PASS. Перемотування перевірене на локальному сервері з HTTP Range.
- Тести: 0/10, 5/10, 10/10, пояснення, перегляд помилок, повторне проходження й збереження стану між мовами — PASS. Page errors відсутні; зовнішні запити блокувалися.
- Фізичні смартфони, iOS/Safari, production, індексацію й аудіозміст на слух не перевіряли.

У цьому checkout збірка генерує сайт у корені, окремий dist не створюється. audio/ лежить у тому самому дереві публікації; локальні HTTP URL обох файлів доступні після збірки. Налаштування publish directory віддаленого хостингу не перевірено.

## Файли
```
 M _headers
 M _redirects
 M ai-catalog.json
 M blog.html
 M blog.md
 M llms-full.txt
 M llms.txt
 M ru/blog.html
 M ru/blog.md
 M scripts/build-blog.py
 M sitemap.xml
 M styles/blog.css
?? audio/
?? blog-yak-zamovyty-yizhu-polskoyu.html
?? blog-yak-zamovyty-yizhu-polskoyu.md
?? content/blog/restaurant-ru.html
?? content/blog/restaurant-uk.html
?? ru/blog-kak-zakazat-edu-na-polskom.html
?? ru/blog-kak-zakazat-edu-na-polskom.md
?? scripts/restaurant-data.js
?? scripts/restaurant.js
```
Додатково створено цей звіт: docs/restaurant-blog-report.md.

Рекомендована назва майбутнього коміту: feat(blog): add bilingual restaurant Polish guide and quizzes
Опис: інтеграція наданих UK/RU статей, двох тестів і оригінальних аудіозаписів через чинні компоненти, з SEO та AI-ресурсами. Коміт не створено.
