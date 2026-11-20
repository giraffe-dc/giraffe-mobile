# Жирафик — мобільний додаток

Нативний додаток (Expo / React Native, iOS + Android + Web) для виїзної команди свят «Жирафик».
Побудований на реальному контенті й API сайту [`giraffe-site`](../../giraffe-site), а не на мок-даних.

> Усі команди нижче виконуються з кореня проєкту `giraffe-mobile/` (крім окремо зазначених випадків).
> Документація — у цій папці `docs/`: [README.md](README.md) · [roadmap.md](roadmap.md).

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

Дизайн і палітра ідентичні сайту ([`src/styles/tokens.css`](../../giraffe-site/src/styles/tokens.css)): сафаровий зелений, глиняний, вохра, папір, чорнило.

## Дані

Додаток використовує **живе API сайту**:

| Призначення | Ендпоінт |
|---|---|
| Каталог (секції `site_content` + відгуки) | `GET https://giraffe-teplyk.vercel.app/api/mobile/catalog` |
| Контакти (телефон, пошта, години, соцмережі) | секція `sections.contacts` у `/api/mobile/catalog` (джерело — `site_content`, редагується в `/admin/content`) |
| Акції | `GET /api/data/offers` |
| Новини | `GET /api/data/news` |
| Заявка | `POST /api/orders` |
| Відгук | `POST /api/reviews` (статус `pending`, модерація в `/admin/reviews`; CORS `*` додано на сайті) |
| Версія APK (перевірка оновлень) | `GET /api/mobile/version` (читає БД сайту, fallback — `version.json`) |
| Публікація версії (зі скрипта збірки) | `POST /api/mobile/version` (ключ `MOBILE_RELEASE_KEY`, викликає `scripts/publish-version.mjs`) |
| Фото | `GET /api/media/<id>?w=<px>` |

Екран «Контакти» більше не читає застарілу колекцію `/api/data/contacts` — усі значення беруться з секції контенту сайту, тому правки в `/admin/content` одразу потрапляють у додаток. У модель контенту додано поле `address`, щоб адресу теж можна було редагувати там (поки не заповнене — використовується значення з офлайн-копії).

Базову адресу змінюйте через змінну `EXPO_PUBLIC_API_BASE` (або в [`src/constants/config.ts`](../src/constants/config.ts)):
`EXPO_PUBLIC_API_BASE=http://localhost:3000 npm start`. Офлайн-копія — точний знімок цих даних
у [`src/data/fallbackCatalog.ts`](../src/data/fallbackCatalog.ts).

Якщо API недоступне (немає інтернету або новий ендпоінт ще не задеплоєний), додаток автоматично
показує офлайн-копію реального контенту — інтерфейс не ламається.

> ⚠️ Ендпоінт `/api/mobile/catalog` додано в [`giraffe-site/src/app/api/mobile/catalog/route.ts`](../../giraffe-site/src/app/api/mobile/catalog/route.ts).
> Після деплою сайту на Vercel додаток автоматично переключиться з фолбеку на живі дані з адмінки (`/admin/content`).

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

**Поточний реліз:** v1.0.3 (build 4), локальний файл `app-release.apk`,
<https://github.com/giraffe-dc/newSite/releases/download/v1.0.3/giraffe-mobile-1.0.3-b4.apk>,
SHA-256 `2C6CA653…E6C80D4` у `release.json`.
У v1.0.3 додано іконку додатку з лого й виправлено фільтр у послугах.

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
  (tabs)/
    _layout.tsx        5 вкладок
    index.tsx          Головна (сезонний банер, швидкі дії)
    services.tsx       Каталог
    packages.tsx       Пакети
    booking.tsx        Форма заявки (календар, чернетка, кошторис)
    contacts.tsx       Контакти, новини, форма відгуку
src/
  api/client.ts        HTTP-клієнт (каталог, версія, заявка, відгук)
  api/normalize.ts     Нормалізація payload каталогу (спільна для API і фолбеку)
  components/common.tsx  Спільні UI-компоненти
  components/DatePicker.tsx  Кастомний календар (APK + PWA)
  components/GalleryImage.tsx  SVG (SvgUri) / растрові картинки галереї
  components/ScreenHeader.tsx  Шапка самостійних сторінок
  constants/           API_BASE, палітра, контакти
  data/fallbackCatalog.ts  Офлайн-копія контенту сайту (scripts/update-fallback.mjs)
  providers/           CatalogProvider (завантаження каталогу)
  store/               BookingStore (вибір, форма, кошторис, чернетка)
  utils/               formatMoney/formatDuration/isItemVariant, shareText
  types/               Типи каталогу й заявки
```
