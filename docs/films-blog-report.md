# Двомовна стаття про фільми та серіали

Підготовлено 28.10.2026. Зміни локальні, commit, push і deploy не виконувалися.

## Файли

Створено:
- `content/blog/films-uk.html`
- `content/blog/films-ru.html`
- `blog-polski-filmy-ta-serialy-dlya-vyvchennya-movy.html`
- `ru/blog-polskie-filmy-i-serialy-dlya-izucheniya-yazyka.html`
- `docs/films-blog-report.md`

Змінено: `scripts/build-blog.py`, `scripts/check-blog.py`, `blog.html`, `ru/blog.html`, `sitemap.xml`.
Попередня користувацька зміна `.vscode/settings.json` не редагувалася.

## Адреси після публікації

- https://expres-polish.pl/blog-polski-filmy-ta-serialy-dlya-vyvchennya-movy.html
- https://expres-polish.pl/ru/blog-polskie-filmy-i-serialy-dlya-izucheniya-yazyka.html

URL адаптовано до чинної плоскої архітектури блогу з розширенням .html.

## Контент, SEO та GEO

Використано надані авторські тексти, H1, Title та Description. Назви творів і структура збережені. Додано пояснення, що A1/A2/B1 є орієнтовними рівнями для перегляду. Картки розміщено першими. Обкладинки не додано, оскільки чинний блог текстовий.

Один H1, послідовні H2/H3, self canonical, взаємні uk/ru/x-default, Open Graph, Twitter summary, BlogPosting і BreadcrumbList. Видима дата оновлення й dateModified: 2026-10-28. datePublished не задано, оскільки публікація ще не виконана. FAQ збережено як видимі запитання та відповіді без FAQPage і без обіцянок розширених результатів. Дата фактичної публікації потребує встановлення під час deploy.

Повний текст міститься у статичному HTML. Нових AI-файлів немає, llms.txt не змінено. Конкретну доступність кожного твору на платформах не заявлено, збережено застереження щодо країни, ліцензій та підписки.

Контекстні посилання UK: `/`, `/#programs`, `/derzhavnyi-ispyt-b1.html`, `/blog-pidhotovka-do-b1.html`.
Контекстні посилання RU: `/ru/`, `/ru/#programs`, `/ru/gosudarstvennyj-ekzamen-b1.html`, `/ru/blog-podgotovka-k-b1.html`.

## Перевірки

- build-blog.py --check, check-blog.py, sync-social-menu.py --check і git diff --check: PASS.
- 8 сторінок: canonical, hreflang, перемикач відповідної статті, JSON-LD, sitemap, внутрішні URL та якорі, один H1, відсутність дубльованих ID.
- Нові статті: усі 8 назв творів, Twitter metadata, відсутність тире та noindex; 1062/1090 слів UK/RU.
- robots.txt дозволяє індексацію, sitemap містить обидві адреси.
- Chrome: 20 комбінацій сторінка/ширина (обидві статті та обидва списки, 320/375/430/768/1440 px), HTTP 200, без горизонтального переповнення та pageerror.
- На 375 px перевірено відкриття мобільної навігації та відкриття/закриття чату Агнешки. Переглянуто мобільний знімок української статті.
- Соціальні меню синхронізовані на 20 сторінках. Instagram, WhatsApp, Агнешка та Raccoon Studio успадковані з чинного шаблону.
- CSS, JS, вихідні header/footer, форми й інтеграції не змінено. Лише посилання перемикача мов у нових сторінках відповідають новій парі. Чотири попередні статті побайтово незмінні.

Обмеження: не виконувалися production-перевірка, перевірка індексації Google, надсилання повідомлень у чат чи зовнішні сервіси, W3C-валідатор або Rich Results Test. HTML перевірено локальним парсером і браузером, JSON-LD локальним JSON-парсером.

Тематичний матеріал переглянуто без копіювання: https://poland-consult.com/polskij-yazyk/filmy-i-serialy.html . Назви серіалів додатково звірено з TVP та TVN: https://www.tvp.info/88383606/polskie-seriale-w-tvp-vod-co-obejrzec-online-ranczo-rodzinkapl-m-jak-milosc-czy-barwy-szczescia , https://tvn.pl/seriale/na-wspolnej .
