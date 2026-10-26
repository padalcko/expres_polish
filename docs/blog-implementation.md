# Двомовний блог Expres Polish — звіт

Дата роботи та перевірки доступних офіційних джерел: 26 жовтня 2026 року.
Статус: локальна реалізація. Commit, push і deploy не виконувалися.

## Попередня інспекція

- Статичні HTML/CSS/JS без framework, CMS або build-залежностей. UA в корені, RU у `/ru/`; сторінки використовують `.html`.
- Раніше блогу не було. На початку робоче дерево було чистим, AGENTS.md не знайдено.
- Дизайн: `styles/style.css`, Inter/Nunito, синій `#0a4d8c`, бірюзовий `#00b8c8`, `.container`, `.card`, округлення 26px та чинний hover.
- Header і mobile-nav статичні в кожній сторінці. На B1/TELC є локальні секційні посилання. Footer не містить окремого меню сторінок, тому блог додано до двох наявних меню, без перебудови footer.
- Соціальна панель: Instagram, WhatsApp, Агнешка, Raccoon Studio. Чинний `scripts/sync-social-menu.py --check` контролює її паритет. Код панелі, чату та локалізовані `script.js`/`script-ru.js` повторно використані без змін.
- Фактичні напрямки: `/derzhavnyi-ispyt-b1.html`, `/ru/gosudarstvennyj-ekzamen-b1.html`, `/telc-polskyi.html`, `/ru/telc-polskij.html`.
- `robots.txt` дозволяє індексацію та посилається на sitemap. Його не потрібно змінювати. Sitemap має мовні alternate; цю схему збережено.

## Нові URL

Нижче майбутні production URL, а не твердження про їх публікацію:

- https://expres-polish.pl/blog.html
- https://expres-polish.pl/ru/blog.html
- https://expres-polish.pl/blog-pidhotovka-do-b1.html
- https://expres-polish.pl/ru/blog-podgotovka-k-b1.html
- https://expres-polish.pl/blog-b1-chy-telc-2026.html
- https://expres-polish.pl/ru/blog-b1-ili-telc-2026.html

Локальний перегляд: `python3 -m http.server 8791`, потім ті самі шляхи на http://127.0.0.1:8791/.

## Створені файли

- Шість HTML-сторінок за шляхами URL вище.
- `content/blog/b1-uk.html`, `content/blog/b1-ru.html` — редакційні HTML-фрагменти посібника.
- `content/blog/compare-uk.html`, `content/blog/compare-ru.html` — редакційні HTML-фрагменти порівняння.
- `styles/blog.css` — виключно scoped стилі `.blog-page`.
- `scripts/build-blog.py` — генератор без сторонніх бібліотек, спільні метадані та розмітка карток/статей; chrome бере з чинних локалізованих сторінок іспитів.
- `scripts/check-blog.py` — перевірка цілісності та меж змін.
- `docs/blog-implementation.md` — цей звіт.

## Змінені файли

Лише два посилання «Блог» у наявних desktop/mobile меню:
`index.html`, `ispyty.html`, `kontakty.html`, `nasha-komanda.html`, `derzhavnyi-ispyt-b1.html`, `telc-polskyi.html`,
`ru/index.html`, `ru/ekzameny.html`, `ru/kontakty.html`, `ru/nasha-komanda.html`, `ru/gosudarstvennyj-ekzamen-b1.html`, `ru/telc-polskij.html`.

Також `sitemap.xml` (шість URL з alternate, без вигаданих lastmod) і `llms.txt` (посилання на новий розділ).
Глобальні CSS, JS, аналітика, форми, footer, текст існуючих сторінок і логіка Агнешки не змінені.

## Реалізація

- Mobile-first grid: 1 колонка базово, 2 від 768px, 4 від 1024px. Зараз дві реальні картки; немає штучного дублювання до чотирьох.
- Немає зображень, декоративних іконок або нових інтерактивних модулів у контенті блогу. Службові іконки чинної соціальної панелі збережено.
- Опис картки короткий; час читання не додавався. Посилання текстові синього кольору з видимим focus.
- Стаття обмежена шириною 760px; line-height 1.8. На вузьких екранах рядки таблиці показуються послідовними блоками з назвами обох іспитів; таблиця залишається семантичною з caption та scope. Горизонтальна прокрутка таблиці не потрібна.
- Обидва мовні перемикачі ведуть на відповідний матеріал, а не головну.
- Увесь текст є в початковому HTML та читається без JavaScript.
- Title, description, H1, self-canonical, uk/ru/x-default hreflang, OG з мовною альтернативою, Blog/BlogPosting та BreadcrumbList. Немає фіктивних image, author, дат публікації, рейтингів чи FAQPage.
- Дата у тексті — дата фактичної перевірки матеріалів, не вигадана дата публікації.
- Для нового матеріалу додати два фрагменти й запис до ARTICLES у генераторі; виконати build та check. Генератор також оновлює блок sitemap. `llms.txt` редагується окремо.

## Редакційний аналіз і джерела

Конкурентні статті прочитані для визначення намірів: організація підготовки, структура, страх помилок, вибір сертифіката під адміністративну мету, витрати й терміни. Їхні приклади, абзаци, обіцянки успішності та спрощення оцінювання не переносилися. Нові матеріали мають власний план, власні тренувальні приклади, діагностику та окреме розмежування процедур.

Конкурентні матеріали:
- https://polishforbelarus.com/kak-podgotovitsya-k-gosekzamenu-po-polskomu-yazyku
- https://polishforbelarus.com/gosudarstvennyj-ekzamen-po-polskomu-ili-telc-v-chem-raznica-i-chto-vybrat-v-2026-godu

Перевірені першоджерела, посилання на які є безпосередньо біля тверджень у статтях:
- https://certyfikatpolski.pl/o-egzaminie/kto-moze-zdawac-egzamin/ — структура дорослого B1.
- https://certyfikatpolski.pl/najczesciej-zadawane-pytania/ — оцінювання, організація та видача сертифікатів.
- https://certyfikatpolski.pl/o-egzaminie/oplaty-za-egzamin/ — максимальні збори.
- https://www.telc.net/en/language-examinations/certificate-exams/polish/ — назва й аудиторія польського продукту.
- https://shop.telc.net/media/catalog/product/file/uebungstest_polnisch.pdf — офіційний зразок Szkoła; не використаний як автоматичне підтвердження регламенту будь-якої дорослої версії.
- https://www.telc.net/en/language-examinations/language-examinations-support-faq/ — загальний орієнтир часу до результату.
- https://telc.pm.szczecin.pl/pl/egzaminy/polski/struktura-egzaminu/ — опис польського B1·B2 конкретним екзаменаційним центром.
- https://www.ur.edu.pl/pl/wydzialy/wydzial-filologiczny/jednostki/centrum-polonijne/telc-polski/informacje-o-egzaminie — незалежне підтвердження практики університетського центру.
- https://www.sejm.gov.pl/sejm10.nsf/InterpelacjaTresc.xsp?key=DVSHSK&view=null — відповідь МВС 07.07.2026 щодо громадянства.
- https://www.gov.pl/web/uw-lodzki/uznanie-za-obywatela-polskiego — мовні документи та перехідний строк щодо поліцеальних шкіл.
- https://eli.gov.pl/eli/DU/2023/1076/ogl — нормативний перелік для резидента ЄС; прочитано також PDF нормативного акта.
- https://www.gov.pl/web/uw-podlaski/zezwolenie-na-pobyt-rezydenta-dlugoterminowego-ue — офіційне пояснення та дата набрання чинності.
- https://eli.gov.pl/eli/DU/2025/1045/ogl — документи про мову навчання; перевірено додаток 1 у PDF gov.pl.

## Що не подавалося як підтверджений універсальний факт

- Точні числові пороги та єдиний регламент усіх дорослих польських TELC: публічний каталог telc використовує назву Szkoła, тоді як центри описують B1·B2. Розбіжність явно пояснена; читачеві запропоновано перевірити версію до оплати. Не використано непідтверджені формули «50% загалом» або «75% для B2» з конкурентних матеріалів.
- Єдина ціна TELC, гарантія строку сертифіката та універсальне прийняття роботодавцем/університетом: залежать від установи й процедури.
- Гарантований строк досягнення B1: план на 10 тижнів є адаптивним навчальним прикладом для відповідної стартової бази.
- Показники успішності, статус школи як екзаменаційного центру, гарантована реєстрація або отримання громадянства: не заявляються.

## Перевірки

- `python3 scripts/build-blog.py --check` — актуальність шести HTML і sitemap; повторна генерація стабільна.
- `python3 scripts/check-blog.py` — H1/main, metadata, JSON-LD, унікальність ID, локальні посилання й anchors, hreflang reciprocity, перемикачі мов, sitemap без дублів, повний текст, відсутність зображень у main, відповідність footer/social чинним компонентам.
- Валідатор порівнює наявні HTML з HEAD: після вилучення доданих посилань «Блог» відмінностей, крім whitespace, немає.
- `python3 scripts/sync-social-menu.py --check` — усі 18 публічних сторінок.
- `git diff --check` — без помилок.
- Chrome/Playwright через локальний HTTP: 12 сторінок × 5 ширин (320, 375, 768, 1024, 1440), 60 перевірок без document/header overflow і без pageerror. До набору входять усі нові сторінки, дві головні та чотири B1/TELC.
- Computed grid: 320/375 — 1, 768 — 2, 1024/1440 — 4 колонки.
- Відкриття/закриття mobile menu й Агнешки на всіх шести нових сторінках; переходи з карток, між мовними редакціями, назад у блог; keyboard skip-link; повний текст статті без JS.
- Знімки desktop/mobile та мобільних таблиць оглянуті. Після огляду таблицю покращено до вертикальних блоків на вузьких екранах.
- Браузерні артефакти: `/tmp/expres-blog/`; результати матриці у `results.json`. Це тимчасові локальні файли.
- Аналітичні запити блокувалися, endpoint чату в тестовій матриці підмінявся; реальні заявки та повідомлення не надсилалися. Перевірка UI чату не є перевіркою живої відповіді n8n.

Production URL, індексація Google, Lighthouse/CWV і реальна доставка повідомлень не перевірялися. Публікація потребує окремого дозволу користувача.
