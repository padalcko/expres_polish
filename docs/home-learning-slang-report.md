# Дві двомовні статті Expres Polish

Локальна інтеграція 11.11.2026. Commit, push і deploy не виконувалися.

Еталон: остання додана пара doctor (06.11.2026), спільний генератор блогу. Текстові картки й статті без обкладинок та авторського підпису відповідають чинному шаблону. Нових зображень, автора, CSS, інтерактивних тестів або залежностей не додано. Дата в нових сторінках: 11.11.2026; це дата підготовки до публікації, не підтвердження deploy. За пізнішої публікації дату потрібно актуалізувати.

## Канонічні URL

- https://expres-polish.pl/blog-yak-vyvchyty-polsku-movu-vdoma.html
- https://expres-polish.pl/ru/blog-kak-vyuchit-polskij-yazyk-doma.html
- https://expres-polish.pl/blog-polskyi-sleng-i-rozmovni-vyrazy.html
- https://expres-polish.pl/ru/blog-polskij-sleng-i-razgovornye-vyrazheniya.html

Збережено чинну архітектуру .html. Чотири рекомендовані вкладені URL з ТЗ (зі слешем і без нього) додано як 301! у _redirects. Правила перевірено статично; їх виконання на Netlify потребує deploy.

## Створені файли

- `blog-polskyi-sleng-i-rozmovni-vyrazy.html`
- `blog-polskyi-sleng-i-rozmovni-vyrazy.md`
- `blog-yak-vyvchyty-polsku-movu-vdoma.html`
- `blog-yak-vyvchyty-polsku-movu-vdoma.md`
- `content/blog/home-learning-ru.html`
- `content/blog/home-learning-uk.html`
- `content/blog/slang-ru.html`
- `content/blog/slang-uk.html`
- `ru/blog-kak-vyuchit-polskij-yazyk-doma.html`
- `ru/blog-kak-vyuchit-polskij-yazyk-doma.md`
- `ru/blog-polskij-sleng-i-razgovornye-vyrazheniya.html`
- `ru/blog-polskij-sleng-i-razgovornye-vyrazheniya.md`
- `scripts/__pycache__/ai_resources.cpython-313.pyc`
- `docs/home-learning-slang-report.md`

## Змінені файли

- `_headers`
- `_redirects`
- `ai-catalog.json`
- `blog.html`
- `blog.md`
- `llms-full.txt`
- `llms.txt`
- `ru/blog.html`
- `ru/blog.md`
- `scripts/build-blog.py`
- `sitemap.xml`

`index.html` мав користувацькі зміни до початку роботи. Файл збережено побайтово відносно початкового стану (SHA-1 перевірено). Старі статті, стилі, скрипти, хедер, футер і соціальне меню не змінені.

## Перевірки

- Дослівне порівняння всіх чотирьох текстів із вкладенням: PASS після видалення лише Markdown/HTML-форматування і нормалізації пробілів. Польські фрази збережено. Довгого/короткого тире немає.
- Генератор блогу: 18 сторінок, freshness PASS.
- SEO: один H1, унікальні задані title/description, один self-canonical, взаємні uk/ru/x-default, мовний перемикач, OG, Twitter Card, BlogPosting і BreadcrumbList; JSON синтаксично валідний. FAQ залишається видимим текстом без FAQPage.
- Google припинив FAQ rich results 07.05.2026; офіційне джерело: https://developers.google.com/search/updates (May 8 / June 15).
- Sitemap містить нові канонічні адреси без дублікатів; robots.txt дозволяє сканування; noindex немає.
- Внутрішні локальні посилання і якорі: PASS.
- GEO: оновлено Markdown сторінок, ai-catalog.json, llms.txt, llms-full.txt і _headers. Збережено пояснення, FAQ і польські приклади, без додаткових фактів чи гарантій AI Overview.
- Стандартний check-blog.py повідомляє лише про попередню користувацьку зміну index.html. Повторна перевірка з виключенням саме цього повідомлення: PASS.
- Стандартний AI freshness/check-ai-search повідомляє про форматування AI-блоку в наявному index.html. Решта очікуваних AI-файлів побайтово відповідає генератору. Форматування головної навмисно збережено.
- Соціальне меню: 30 сторінок synchronized. git diff --check: PASS.
- Chrome: 4 сторінки × 360, 390, 430, 768, 1440 px = 20 перевірок. HTTP 200; горизонтального скролу і JS pageerror немає; один H1; перемикачі ведуть на відповідні переклади; Агнешка відкривається і закривається. Переглянуто мобільний скриншот статті про сленг.
- Зовнішні запити у браузерному QA заблоковано. Реальні відповіді Агнешки, аналітика, зовнішні соцмережі та production/indexing не перевірялися.
- Автоматизація QA зберігається лише у /tmp/expres-two; нових тестів у репозиторії немає. Самоперевірочних тестів у статтях немає.

## Контекстні внутрішні посилання


`blog-yak-vyvchyty-polsku-movu-vdoma.html`:

- `/blog-yak-zapysatysia-do-likaria-v-polshchi.html`
- `/derzhavnyi-ispyt-b1.html`
- `/blog-polski-filmy-ta-serialy-dlya-vyvchennya-movy.html`
- `/#programs`

`ru/blog-kak-vyuchit-polskij-yazyk-doma.html`:

- `/ru/blog-kak-zapisatsya-k-vrachu-v-polshe.html`
- `/ru/gosudarstvennyj-ekzamen-b1.html`
- `/ru/blog-polskie-filmy-i-serialy-dlya-izucheniya-yazyka.html`
- `/ru/#programs`

`blog-polskyi-sleng-i-rozmovni-vyrazy.html`:

- `/blog-polski-filmy-ta-serialy-dlya-vyvchennya-movy.html`
- `/#programs`
- `/derzhavnyi-ispyt-b1.html`

`ru/blog-polskij-sleng-i-razgovornye-vyrazheniya.html`:

- `/ru/blog-polskie-filmy-i-serialy-dlya-izucheniya-yazyka.html`
- `/ru/#programs`
- `/ru/gosudarstvennyj-ekzamen-b1.html`
