# Жирафик — мобільний додаток

Нативний додаток (Expo / React Native, iOS + Android + Web) для виїзної команди свят «Жирафик».
Побудований на реальному контенті й API сайту [`giraffe-site`](../../giraffe-site), а не на мок-даних.

> Усі команди нижче виконуються з кореня проєкту `giraffe-mobile/` (крім окремо зазначених випадків).
> Документація — у цій папці `docs/`: [README.md](README.md) · [roadmap.md](roadmap.md) · [stage4-plan.md](stage4-plan.md) (підготовка до Етапу 4: план, блокери, оцінка).

## Що вміє

- **Головна** — герой, цифри довіри, сезонний банер, швидкі дії (кошторис, підбір, галерея, FAQ), популярні послуги, пакети, сценарій дня, гарантії, галерея альбомів, відгуки.
- **Послуги** — каталог із пошуком і фільтром за категоріями, фото, варіантами тривалості й цін.
- **Пакети** — готові комплекси зі списком того, що входить.
- **Калькулятор «Збери сам»** — послуги × варіанти (кількість для «за шт»), пакети з економією, транспорт за відстанню, підсумок «поділитися» і перенесення в заявку.
- **Підбір програми** — вік → кількість гостей → тривалість → підходящі послуги й пакети (ліміт групи з адмінки сайту).
- **Галерея** — альбоми з фільтрами за категоріями, перегляд фото на весь екран, відео, перехід до програми.
- **FAQ** — акордеон із секції `faq` сайту.
- **Бронювання** — вибрана послуга/пакет або позиції кошторису потрапляють у заявку; календар вибору дати, швидкі чіпси часу, чернетка форми переживає перезапуск; форма надсилається напряму в `/api/orders` сайту (запис у MongoDB + Telegram-сповіщення команді). Deep link `giraffe://book?…` / `/book?…` відкриває заповнену заявку.
- **Контакти** — телефон, пошта, години, адреса виїзду, соцмережі, акції та новини (розгортаються), форма відгуку зі зірками (`POST /api/reviews`, модерація в адмінці сайту).
- **Кабінет** — вхід за телефоном без пароля: 6-значний код приходить у Telegram-бот (або deep link при першому вході); історія власних заявок зі статусами, деталі заявки, оновлення списку, вихід. Токен живе в AsyncStorage і шлеться як `Authorization: Bearer`.
- **Чат із командою** — окремий екран (`/chat`) на базі `/api/chat*`: threadId зберігається в AsyncStorage, відповіді операторів підтягуються polling-ом; оператори працюють в адмінці сайту/Telegram.
- **Опитування** — якщо до новини прикріплене опитування, у розгорнутій новині з'являється форма (variants або довільні поля) з голосуванням через `/api/survey/*`.
- **Push-нагадування** — після входу реєструється Expo push-токен (`POST /api/mobile/push-token`); сповіщення про статус заявки, за день до свята й запит відгуку. На PWA не реєструються (критичні події дублюються в чаті).
- **Геолокація** — кнопка у формі бронювання рахує відстань від Теплика й орієнтовну вартість дороги за тарифом із адмінки; понад 40 км — попередження, **не блокування**.
- **Календар** — у деталях заявки кнопка «Додати в календар» створює подію з нагадуванням за день (лише нативні збірки; у PWA прихована).
- **Приватність** — екран згоди при першому запуску й налаштування: аналітика (opt-in), push, геолокація, посилання на `/privacy`. Аналітика й гео працюють тільки за згодою.
- **Доступність** — масштаб шрифту 100/115/130% і підвищений контраст у налаштуваннях (застосовується до всіх екранів через спільний текстовий компонент). Dark mode свідомо не робиться.
- **Аналітика воронки** — знеособлені події («каталог → розрахунок → заявка → підтвердження») у власній БД сайту, перегляд в адмінці `/admin/analytics`.

Дизайн і палітра ідентичні сайту ([`src/styles/tokens.css`](../../giraffe-site/src/styles/tokens.css)): сафаровий зелений, глиняний, вохра, папір, чорнило.

## Дані

Додаток використовує **живе API сайту**:

| Призначення | Ендпоінт |
|---|---|
| Каталог (секції `site_content` + відгуки) | `GET https://giraffe-teplyk.vercel.app/api/mobile/catalog` |
| Контакти (телефон, пошта, години, соцмережі) | секція `sections.contacts` у `/api/mobile/catalog` (джерело — `site_content`, редагується в `/admin/content`) |
| Акції | `GET /api/data/offers` |
| Новини | `GET /api/data/news` |
| Заявка | `POST /api/orders` (повертає `{success, id}`) |
| Відгук | `POST /api/reviews` (статус `pending`, модерація в `/admin/reviews`; CORS `*` додано на сайті) |
| Кабінет: запит коду | `POST /api/mobile/auth/request-code` → `{delivery:"telegram"|"link", mask, link?}` |
| Кабінет: підтвердження | `POST /api/mobile/auth/verify` → JWT `role:"user"` (30 днів) + cookie `client_token` |
| Кабінет: мої заявки | `GET /api/mobile/orders` (Bearer або cookie; тільки власні, за телефоном) |
| Зайняті дати (попередження) | `GET /api/mobile/busy-dates` (публічний, лише дати) |
| Чат: історія / нові відповіді / запис | `GET /api/chat/history`, `GET /api/chat/poll`, `POST /api/chat/message` |
| Опитування | `POST /api/survey/vote`, `POST /api/survey/submit`, `GET /api/survey/results` |
| Push: реєстрація/видалення токена | `POST /api/mobile/push-token` (Bearer), `DELETE /api/mobile/push-token?token=…` |
| Push: щоденні нагадування (cron) | `GET /api/cron/push-reminders` (секрет `CRON_SECRET` або `MOBILE_RELEASE_KEY`) |
| Аналітика: події воронки | `POST /api/mobile/events` (батч, тільки за згодою) |
| Аналітика: воронка для адміна | `GET /api/admin/analytics/funnel?days=7` (cookie `admin_token`) |
| Версія APK (перевірка оновлень) | `GET /api/mobile/version` (читає БД сайту, fallback — `version.json`) |
| Публікація версії (зі скрипта збірки) | `POST /api/mobile/version` (ключ `MOBILE_RELEASE_KEY`, викликає `scripts/publish-version.mjs`) |
| Фото | `GET /api/media/<id>?w=<px>` |

Швидка перевірка живих деплоїв (сайт + PWA, без записів у БД):
`node giraffe-site/scripts/check-live-deploy.mjs` (запуск із кореня робочої папки)
— виводить статуси нових ендпойнтів і CORS для origin PWA;
`404 /chat` означає, що Vercel ще не пере-deployив `giraffe-mobile`.

Екран «Контакти» більше не читає застарілу колекцію `/api/data/contacts` — усі значення беруться з секції контенту сайту, тому правки в `/admin/content` одразу потрапляють у додаток. У модель контенту додано поле `address`, щоб адресу теж можна було редагувати там (поки не заповнене — використовується значення з офлайн-копії).

Базову адресу змінюйте через змінну `EXPO_PUBLIC_API_BASE` (або в [`src/constants/config.ts`](../src/constants/config.ts)):
`EXPO_PUBLIC_API_BASE=http://localhost:3000 npm start`. Офлайн-копія — точний знімок цих даних
у [`src/data/fallbackCatalog.ts`](../src/data/fallbackCatalog.ts).

Якщо API недоступне (немає інтернету або новий ендпоінт ще не задеплоєний), додаток автоматично
показує офлайн-копію реального контенту — інтерфейс не ламається.

> ⚠️ Ендпоінт `/api/mobile/catalog` додано в [`giraffe-site/src/app/api/mobile/catalog/route.ts`](../../giraffe-site/src/app/api/mobile/catalog/route.ts).
> Після деплою сайту на Vercel додаток автоматично переключиться з фолбеку на живі дані з адмінки (`/admin/content`).

## Кабінет: вхід без пароля (Етап 3)

Код надсилає **наявний бот чату сайту** (`TELEGRAM_CHAT_BOT_TOKEN`) — новий платний SMS-провайдер не потрібен.

1. Користувач вводить український номер → `POST /api/mobile/auth/request-code`.
2. Якщо номер уже прив'язаний (`client_telegrams`), бот пише 6 цифр у приватний чат; додаток показує поле вводу.
3. Перший вхід — у відповіді `delivery: "link"` і deep link `https://t.me/<бот>?start=otp_<id>`; після «Start» webhook бота створює прив'язку `phone ↔ chatId`, а додаток перевіряє вхід викликом `verify` без коду (автоматично при поверненні в застосунок або кнопкою).
4. `POST /api/mobile/auth/verify` повертає JWT `role:"user"` (30 днів). У React Native він шлеться як `Authorization: Bearer`, для PWA додатково ставиться cookie `client_token` (`SameSite=None; Secure`, бо PWA на іншому домені).
5. `GET /api/mobile/orders` шукає заявки за телефоном із токена (підтримуються старі формати запису номера); чужі заявки не повертаються.

Коди зберігаються в колекції `otp_codes` лише у вигляді хеша з `NEXTAUTH_SECRET`, TTL 10 хвилин, не більше 5 спроб; ліміти — 3 запити коду на номер і 10 на IP за 10 хвилин. Webhook `/start otp_<id>` приймається тільки з приватного чату, secret-token перевіряється як і раніше.

> ⚠️ **Обмеження без SMS:** при першому вхідному номері немає доведення володіння телефоном — хто першим відкриє deep link, той і прив'яже номер до свого Telegram. Після прив'язки код надсилається тільки в цей чат. Для скидання прив'язки адміністратор видаляє документ `client_telegrams` із номером у БД сайту. Повноцінне доведення можливе лише з платним SMS-провайдером.

### Змінні середовища для push (Vercel, сайт)

- `CRON_SECRET` — секрет для `GET /api/cron/push-reminders` (Vercel Cron надсилає `Authorization: Bearer <CRON_SECRET>`). Якщо не задати — ендпоінт приймає вже наявний `MOBILE_RELEASE_KEY`.
- `EXPO_PUSH_TOKEN` — опційний серверний токен Expo для Push API (без нього працює з жорсткішими лімітами).

> ⚠️ **Push і EAS projectId:** Expo SDK 54 вимагає `projectId` для `getExpoPushTokenAsync()`.
> У цьому проєкті EAS не використовується, тому без змінної `EXPO_PUBLIC_PROJECT_ID`
> (задається на етапі збірки APK з безкоштовного EAS-проєкту Expo ) реєстрація push
> тихо пропускається — геолокація, календар, чат і кабінет працюють нормально.
> Після появи projectId додайте його в `.env` і перезберіть APK — серверна частина
> (`/api/mobile/push-token`, cron, sending) уже готова.

## Тест на реальному пристрої (окремий APK)

Після `npx expo prebuild --platform android` у теці `android/` лежить нативний проєкт.
Збірка standalone-APK (не потребує Metro-сервера на ПК):

```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-17'
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
cd android
.\gradlew.bat assembleRelease
```

APK: `android/app/build/outputs/apk/release/app-release.apk`.
Його можна перекинути на телефон (Google Drive, USB, Telegram) і відкрити — Android дозволить встановити з невідомого джерела. Або встановити через кабель:

```powershell
adb install -r android\app\build\outputs\apk\release\app-release.apk
```

> ⚠️ На Windows із довгим шляхом до проєкту CMake-збірка падає через ліміт 260 символів,
> а `subst G:` дає несумісні шляхи в React Native codegen. Тому скрипт `scripts/build-apk.ps1`
> сам копіює проєкт у короткий реальний шлях `C:\g`, робить там `expo prebuild` і збирає APK.
> Запускайте його, а не `gradlew` напряму. У `android/` лежать копії `package.json` і `app.json`
> для Expo-автолінкінгу — не видаляйте їх.

### Реліз і розсилка клієнтам (без сторів)

**APK не зберігається ні в git, ні на Vercel** (ліміт GitHub 50 МБ на файл, Vercel не має
тримати бінарі у деплої). Дистрибуція — через **GitHub Releases** репозиторію
`giraffe-dc/newSite`: тег `v<versionName>`, ассет `giraffe-mobile-<версія>-b<build>.apk`.

Єдине джерело версії — [`release.json`](../release.json): `versionName`, `versionCode`,
`changelog`, `sha256`, `apkUrl` (прямий посилання на ассет у GitHub Releases).
Актуальний маніфест живе **в БД сайту** (колекція `mobile_releases`): скрипт збірки
публікує його через `POST /api/mobile/version` (API-ключ `MOBILE_RELEASE_KEY`),
тому **деплой сайту після релізу не потрібен**. Файл
`giraffe-site/public/app/version.json` лишається лише як fallback, коли БД порожня.

Сторінка [`/app`](../../giraffe-site/src/app/app/page.tsx) показує QR-код (кодує `apkUrl`),
версію, список змін і SHA-256; кнопка «Завантажити APK» веде на GitHub Releases.
`GET /api/mobile/version` віддає той самий `apkUrl` з CORS `*`.

Збірка одним скриптом (копіює проєкт у `C:\g`, prebuild, Gradle, рахує SHA-256,
завантажує APK у GitHub Releases через `scripts/upload-release.mjs` — аутентифікація
з git credential helper — і публікує маніфест у БД сайту через
`scripts/publish-version.mjs`; ключ — env `MOBILE_RELEASE_KEY`):

```powershell
.\scripts\build-apk.ps1 -VersionCode 4 -VersionName "1.0.3"
```

Локальний APK після збірки: `giraffe-mobile/app-release.apk`.

Далі нічого деплоїти не треба: маніфест уже в БД сайту, а додаток при старті
звертається до `GET /api/mobile/version` і, якщо `versionCode` на сайті більший
за вбудований, показує модалку «Доступна нова версія» із завантаженням `apkUrl`.
Якщо API недоступне — працює тихо.
Перевірка модалки на локальному сервері неможлива: релізний APK завжди звертається до
продакшн-адреси (`EXPO_PUBLIC_API_BASE` задається на етапі збірки).

**Поточний реліз:** v1.0.4 (build 5), локальний файл `app-release.apk`,
<https://github.com/giraffe-dc/newSite/releases/download/v1.0.4/giraffe-mobile-1.0.4-b5.apk>,
SHA-256 `64A2D655…D273C` у `release.json`.
У v1.0.4 додано кабінет (OTP via Telegram, історія заявок), попередження про зайняті
дати, чат із командою, опитування, геолокацію й календар.
Push-реєстрація в цій збірці неактивна без `EXPO_PUBLIC_PROJECT_ID` (див. розділ про push вище).

### PWA для iPhone (web-експорт, Етап 1)

iOS-канал = PWA (рішення власника: Apple Developer Program немає й не планується).
Web-експорт Expo збирається в `dist/` і хоститься **окремим Vercel-проєктом**
(шляхи `/_expo/...` абсолютні — потрібен корінь домену):

```bash
npm run export:pwa     # expo export --platform web → dist/
```

Що входить у PWA:

- `app/+html.tsx` — кореневий HTML-шел: `theme-color`, `apple-mobile-web-app-capable`,
  `apple-touch-icon`, `<link rel="manifest">`, реєстрація `sw.js`;
- `public/manifest.webmanifest` — назва «Жирафик», `display: standalone`,
  `theme_color: #1E5B3F`, `background_color: #FBF7EE`, іконки 192/512 (з `brand/logo.png` сайту);
- `public/sw.js` — навігація: network-first із офлайн-фолбеком; статика `/_expo/**`:
  cache-first; `/api/**` та бекенд: тільки мережа (кешується нічого);
- `public/icons/` — `icon-192/512.png`, `apple-touch-icon.png` (180), `favicon.png`;
- `app/_layout.tsx` — `<DocumentTitle>` (заголовки документів для статичних HTML);
- `expo.web` у `app.json` — `output: "static"`, назва, кольори, `display: standalone`.

**Деплой (окремий Vercel-проєкт):**

1. Vercel → *New Project* → репозиторій `giraffe-dc/newSite`;
2. Root Directory: `giraffe-mobile`, Framework: *Other* (налаштування вже в `vercel.json`:
   build `npm run export:pwa`, output `dist`, кеш для `/_expo/*`, `no-cache` для `sw.js`);
3. Domain проєкту (напр. `pwa.giraffe-tepk.vercel.app`) записати в змінну
   `NEXT_PUBLIC_PWA_URL` сайту `giraffe-site` — тоді на сторінці `/app`
   з'явиться кнопка «Відкрити PWA-версію» (без неї кнопка ховається);
4. Встановлення на iPhone: відкрити URL у Safari → «Поділитися» → «На головний екран».

Бекенд PWA використовує той самий API, що й додаток (`EXPO_PUBLIC_API_BASE`,
за замовчуванням продакшн-сайт) — CORS уже додано на `/api/mobile/*`, `/api/orders`,
`/api/data/*`. Локальна перевірка зібраного PWA: `npx serve dist -l 4173`.

## Запуск

```bash
cd giraffe-mobile
npm install
npm start            # Expo Dev Server (QR-код для Expo Go)
npm run android      # емулятор/пристрій Android
npm run ios          # симулятор iOS (macOS)
npm run web          # браузер
npm run ts:check     # перевірка типів
```

Збірка для релізу:

```bash
npx expo export --platform android
npx expo export --platform ios
eas build --platform all       # потрібний EAS CLI + акаунт Expo
```

## Структура

```
app/
  _layout.tsx          Root stack + провайдери даних і заявки
  +html.tsx            Кореневий HTML-шел PWA (метатеги, реєстрація sw.js)
  details.tsx          Екран деталей послуги/пакета
  calculator.tsx       Калькулятор «Збери сам» (Етап 2)
  assistant.tsx        Підбір програми (Етап 2)
  gallery.tsx          Галерея альбомів (Етап 2)
  faq.tsx              FAQ-акордеон (Етап 2)
  book.tsx             Приймач deep links /book?… → форма бронювання
   chat.tsx             Чат із командою (екран, /api/chat*)
   settings.tsx         Приватність, згода, доступність (шрифт/контраст)
  (tabs)/
    _layout.tsx        5 вкладок + Кабінет (Етап 3)
    index.tsx          Головна (сезонний банер, швидкі дії)
    services.tsx       Каталог
    packages.tsx       Пакети
    booking.tsx        Форма заявки (календар, чернетка, кошторис)
    contacts.tsx       Контакти, новини, форма відгуку
     cabinet.tsx        Кабінет: OTP-вхід, історія заявок, статуси
src/
  api/client.ts        HTTP-клієнт (каталог, версія, заявка, відгук, кабінет)
  api/normalize.ts     Нормалізація payload каталогу (спільна для API і фолбеку)
  components/common.tsx  Спільні UI-компоненти
  components/DatePicker.tsx  Кастомний календар (APK + PWA)
  components/GalleryImage.tsx  SVG (SvgUri) / растрові картинки галереї
  components/SurveyCard.tsx    Опитування в новинах (/api/survey/*)
  components/ScreenHeader.tsx  Шапка самостійних сторінок
  constants/           API_BASE, палітра, контакти
  data/fallbackCatalog.ts  Офлайн-копія контенту сайту (scripts/update-fallback.mjs)
  providers/           CatalogProvider, BookingStore, AuthProvider,
                        PrivacyProvider (згода), AccessibilityProvider (шрифт/контраст)
   services/            push.ts, geo.ts, calendar.ts, privacy.ts, analytics.ts
   components/AccessibleText.tsx  Спільний Text із масштабуванням і контрастом
   components/ConsentGate.tsx     Екран згоди при першому запуску
  store/               BookingStore (вибір, форма, кошторис, чернетка)
  utils/               formatMoney/formatDuration/isItemVariant, shareText
  types/               Типи каталогу й заявки
```
