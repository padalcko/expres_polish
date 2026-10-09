# Картки іспитів і соціальне меню — підсумковий звіт

Оновлено 9 жовтня 2026. Останні зауваження користувача враховано: компактні картки, два згенеровані тематичні зображення, бірюзові кнопки як у форми запису.

## Остаточний вигляд карток

- Оновлено `#directions` у `ispyty.html` і `ru/ekzameny.html`.
- Desktop: дві рівні картки, загальна ширина до 960 px. При ширині екрана менше 900 px — одна колонка до 480 px.
- Зображення мають явно обмежену висоту: 180 px у вузькому компонуванні та 208 px у двоколонковому. HTML width/height не можуть розтягнути картку до природної висоти великого зображення.
- Скорочено описи, зменшено внутрішні відступи й типографіку карток; прибрано тимчасову графіку B1 та старе зображення онлайн-заняття.
- CTA використовує спільний `.btn--primary`: бірюзовий `#00b8c8`, білий текст, hover `#00a4b3`, висота від 48 px. Темно-синій фон і збільшену висоту 72 px прибрано. Колір відповідає останній прямій вказівці користувача; попередня вимога AA для білого дрібного тексту на цьому кольорі не заявляється як виконана.
- Вся картка — одне посилання, без вкладених посилань. Заголовки, маршрути та переклади відповідають мові сторінки.
- Стилі header/footer, форми, інтеграції, SEO head і решта секцій у цьому виправленні не змінювалися.

## Згенеровані зображення

Використано вбудований інструмент `image_gen` за навичкою `imagegen`, не CLI/API fallback. Це ілюстративні згенеровані сцени, не документальні фотографії школи чи реального іспиту.

- B1: двоє дорослих студентів виконують письмові вправи в аудиторії.
- TELC: двоє студентів практикують розмову з викладачкою.
- Обидві сцени мають узгоджені природне освітлення, світлу аудиторію та бірюзові/сині деталі. Немає написів, логотипів чи водяних знаків.
- Створено WebP у трьох розмірах для кожної сцени, підключено srcset/sizes, локалізовані alt, width/height, lazy loading та async decoding.

Файли в репозиторії:

- `img/exam-b1-preparation-480.webp`
- `img/exam-b1-preparation-800.webp`
- `img/exam-b1-preparation-1120.webp`
- `img/exam-telc-preparation-480.webp`
- `img/exam-telc-preparation-800.webp`
- `img/exam-telc-preparation-1120.webp`

### Остаточний prompt B1

> Create a photorealistic editorial website card image for a Polish language school: preparation for the Polish state B1 language exam. Landscape 3:2. Two adult students, a woman and a man in their twenties, seated side by side at a light oak classroom table, concentrating on writing practice exercises on plain worksheets, with a teacher softly out of focus in the background. Bright tidy contemporary classroom, natural daylight, warm off-white walls, subtle turquoise stationery and navy clothing accents. Authentic calm candid mood, natural faces and hands, professional educational photography, medium-wide framing, people and papers composed within the middle horizontal band so a shallow panoramic crop remains effective. No overlaid text, no readable words, no logos, no watermark, no certificate, no flags. Single continuous scene, not a collage.

### Остаточний prompt TELC

> Create a photorealistic editorial website card image for a Polish language school: TELC Polish language exam preparation through speaking practice. Landscape 3:2. Two adult students in their twenties, a woman and a man, seated facing one another at a light oak classroom table, practicing a friendly conversation, listening attentively; an adult female tutor sits to one side holding plain prompt cards. Not a formal exam, a preparation lesson. Bright tidy contemporary classroom, natural daylight, warm off-white walls, subtle turquoise notebook and navy clothing accents. Authentic candid mood, relaxed but focused, natural faces and hands, professional educational photography. Medium-wide framing with people in the middle horizontal band for a shallow panoramic crop. Coordinated with a companion image of written classroom practice. No overlaid text, no readable words, no logos, no watermark, no certificate, no flags. Single continuous scene, not a collage.

## Соціальне меню — завершений попередній етап

Публічних HTML-сторінок 12, меню спочатку було на 6. Додано на `ispyty.html`, `ru/ekzameny.html`, `derzhavnyi-ispyt-b1.html`, `ru/gosudarstvennyj-ekzamen-b1.html`, `telc-polskyi.html`, `ru/telc-polskij.html`. Окремих сторінок курсів/404 та інших мов у репозиторії немає.

Збережено Instagram, WhatsApp, Агнешку й Raccoon Studio, їхні URL, порядок і SVG. Канонічне джерело кожної мови — головна сторінка. `python3 scripts/sync-social-menu.py` синхронізує статичний HTML; `--check` перевіряє покриття, відсутність дублів та наявність чату й мовного скрипту. Перевірку додано в `.github/workflows/check-social-menu.yml`.

На попередньому етапі виконано 56 браузерних перевірок адаптивності, 24 перевірки Агнешки (12 сторінок × mobile/desktop) з mock-відповідями, 8 форм із mock HTTP 200 та hit-testing 42 полів/кнопок. Реальних звернень до n8n не було. JavaScript page errors: 0. Після виправлення довгих заголовків 12 сторінок пройшли перевірку на 320 px без горизонтального переповнення. Цей функціонал під час остаточного виправлення карток не змінювався; перевірку синхронізації повторено.

## Файли остаточного виправлення

- `ispyty.html`
- `ru/ekzameny.html`
- `styles/exams.css`
- Шість WebP, перелічених вище.
- `docs/exams-social-audit.md`

## Межі перевірки

Production CWV, реальна доставка заявок/відповіді n8n та Safari/Firefox не перевірялися. Commit, push і публікацію під час цієї роботи не виконано. Нестачу другого зображення усунуто генерацією за прямим запитом користувача.

## Перевірки фінального виправлення, 9 жовтня

- 16 комбінацій: UK/RU × 320, 375, 390, 768, 1024, 1280, 1440, 1920 px.
- Без горизонтального overflow та обрізаних заголовків у секції; JavaScript page errors: 0.
- Усі нові зображення завантажуються. Висота обох медіазон однакова й не перевищує 208 px.
- При 1440 px картки мають ширину 468 px, висоту 437,5 px в UK та 465 px у RU; CTA має висоту 48 px і однакову вертикальну позицію в парі.
- Перевірений computed background CTA: rgb(0, 184, 200).
- Виконано чотири реальні переходи за картками B1/TELC UK/RU; URL правильні.
- Desktop і mobile screenshots візуально переглянуто. `sync-social-menu.py --check`: 12/12. `git diff --check`: без помилок.
