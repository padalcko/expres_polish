# Двомовна стаття про запис до лікаря

Інтегровано повний наданий український та російський матеріал. На новій картці кожного мовного блогу встановлено плашку **Тест 🧑‍⚕️**. Нова стаття стоїть першою.

## Маршрути (підготовлені локально)

- https://expres-polish.pl/blog-yak-zapysatysia-do-likaria-v-polshchi.html
- https://expres-polish.pl/ru/blog-kak-zapisatsya-k-vrachu-v-polshe.html

## Реалізація

`doctor.js` передає двомовні дані до чинного `mountQuiz` з `quiz-engine.js`. У кожній мові рівно 10 запитань, по три варіанти, одна правильна відповідь; ключ A,A,B,C,A,B,C,A,B,C. Збережено усталену покрокову механіку еталона: відповідь, перевірка з поясненням, наступне запитання, результат і перегляд помилок, повторне проходження. Прогрес зберігається в sessionStorage та переноситься між мовами. Окремого рушія тестів немає. Додано параметр рівня A1–B1; еталон зберігає A0–A2.

Текст перенесено програмно з вкладення. Порівняння нормалізованого видимого тексту з оригіналом пройшло для обох мов. Маркери інтеграції замінено віджетами. Наявний авторський CTA посилається на локалізований розділ курсів; додано посилання на статтю про самопрезентацію.

## SEO та дизайн

Окремі Title/Description, canonical, взаємні uk/ru/x-default, lang, Open Graph, Twitter Card, BlogPosting, BreadcrumbList, sitemap, Markdown/AI-ресурси. По одному H1, таблиці з чинною адаптивною обгорткою. Дата створення 2026-11-06; datePublished/dateModified не вигадані: публікації та наступного редагування ще немає.

CSS, Header/Footer, навігація, Агнешка, соціальне меню та посилання Raccoon Studio не змінені. Мовний перемикач формується чинним генератором для відповідної пари сторінок.

Відповідного фото поліклініки в наявних ресурсах немає. Зображення не додано; залишено стандартні текстові картки та статті еталона, як дозволяє завдання за відсутності відповідного матеріалу.

## Файли

Створені:

- `content/blog/doctor-uk.html`, `content/blog/doctor-ru.html`
- `scripts/doctor-data.js`, `scripts/doctor.js`, `scripts/check-doctor.cjs`
- `blog-yak-zapysatysia-do-likaria-v-polshchi.html` та `.md`
- `ru/blog-kak-zapisatsya-k-vrachu-v-polshe.html` та `.md`
- `docs/doctor-blog-report.md`

Змінені:

- `scripts/build-blog.py`, `scripts/quiz-engine.js`
- `blog.html`, `ru/blog.html`, `blog.md`, `ru/blog.md`
- `sitemap.xml`, `_headers`, `ai-catalog.json`, `llms.txt`, `llms-full.txt`

## Перевірки

- `build-site.py`, `build-site.py --check`: збірка і актуальність.
- `check-blog.py`: 14 сторінок, метадані, JSON-LD, посилання, мовні пари, sitemap, збереження інших сторінок.
- `check-ai-search.py`: HTML/Markdown, каталог і внутрішні посилання.
- `sync-social-menu.py --check`: синхронізація меню.
- Точне порівняння авторського тексту після нормалізації форматування: UK/RU PASS.
- `check-introduction.cjs`: еталон, 10 перевірок ширин, тест, конструктор, клавіатура, локалізація, обмежене сховище, no-JS, відсутність JS-помилок — PASS.
- Нові статті, Chrome: 320/375/430/768/1440 px в обох мовах без горизонтального переповнення; результати 0/10, 5/10, 10/10, пояснення, повтор, перенесення стану між мовами — PASS; JS-помилок немає.
- `git diff --check`: PASS.

Перевірки локальні; production та індексацію не перевірено. Commit, push, deploy не виконувалися.

## Запропонований коміт

`feat(blog): add bilingual doctor appointment guide with quizzes`

Add Ukrainian and Russian educational articles about booking medical appointments in Poland. Reuse the existing interactive quiz architecture with 10 localized questions per language. Integrate SEO metadata, canonical URLs, hreflang, structured data, sitemap entries, and internal linking while preserving the existing Expres Polish design.
