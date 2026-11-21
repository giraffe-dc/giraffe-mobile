<#
  Збірка APK для прямої розсилки клієнтам (без Play Store).

  Windows-специфіка: CMake падає на шляхах довших за 260 символів, а subst G:
  дає несумісні шляхи в React Native codegen. Тому проєкт копіюється в короткий
  реальний шлях C:\g, там генерується android/ і збирається APK.

  APK не зберігається в git/Vercel (ліміт GitHub 50 МБ, Vercel не тримає бінарі):
  скрипт завантажує його в GitHub Releases (scripts/upload-release.mjs) і оновлює
  release.json із прямим посиланням. Маніфест публікується в БД сайту через
  scripts/publish-version.mjs (POST /api/mobile/version) — деплой сайту не потрібен.

  Використання:
    .\scripts\build-apk.ps1 -VersionCode 4 -VersionName "1.0.3"
#>
param(
  [int] $VersionCode = 0,
  [string] $VersionName = ""
)

$ErrorActionPreference = "Stop"

$appRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$buildRoot = "C:\g"
$releasePath = Join-Path $appRoot "release.json"
$appJsonPath = Join-Path $appRoot "app.json"

$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA "Android\\Sdk"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$release = Get-Content $releasePath -Raw -Encoding UTF8 | ConvertFrom-Json
if ($VersionCode -gt 0) { $release.versionCode = $VersionCode }
if ($VersionName) { $release.versionName = $VersionName }

Write-Host "Підготовка версії v$($release.versionName) (build $($release.versionCode))..."

# Оновлюємо джерело версії до синхронізації з нативним проєктом.
[System.IO.File]::WriteAllText($releasePath, ($release | ConvertTo-Json -Depth 8), $utf8NoBom)

$appJson = Get-Content $appJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
$appJson.expo.version = $release.versionName
$appJson.expo.android.versionCode = [int] $release.versionCode
[System.IO.File]::WriteAllText($appJsonPath, ($appJson | ConvertTo-Json -Depth 12), $utf8NoBom)

# Копіюємо проєкт у короткий шлях (без build-артефактів і старих node_modules).
if (Test-Path $buildRoot) { Remove-Item -Recurse -Force $buildRoot }
New-Item -ItemType Directory -Force $buildRoot | Out-Null
robocopy $appRoot $buildRoot /E /NFL /NDL /NJH /NJS `
  /XD (Join-Path $appRoot "android\\build") `
      (Join-Path $appRoot "android\\app\\build") `
      (Join-Path $appRoot ".expo") | Out-Null

# Генеруємо нативний проєкт у короткому шляху.
Write-Host "Prebuild у $buildRoot ..."
cmd /c "cd /d $buildRoot && npx expo prebuild --platform android --clean"
if ($LASTEXITCODE -ne 0) { throw "Expo prebuild завершився з помилкою $LASTEXITCODE" }

Copy-Item (Join-Path $buildRoot "package.json") (Join-Path $buildRoot "android\\package.json") -Force
Copy-Item (Join-Path $buildRoot "app.json") (Join-Path $buildRoot "android\\app.json") -Force

Write-Host "Збірка APK..."
cmd /c "cd /d $buildRoot\\android && gradlew.bat assembleRelease --no-daemon"
if ($LASTEXITCODE -ne 0) { throw "Gradle збірка завершилася з помилкою $LASTEXITCODE" }

$apkSource = Join-Path $buildRoot "android\\app\\build\\outputs\\apk\\release\\app-release.apk"
if (-not (Test-Path $apkSource)) { throw "APK не знайдено: $apkSource" }

Copy-Item $apkSource (Join-Path $appRoot "app-release.apk") -Force

$release.publishedAt = (Get-Date).ToString("yyyy-MM-dd")
$release.sha256 = (Get-FileHash $apkSource -Algorithm SHA256).Hash

# APK не потрапляє в git/Vercel (ліміти розміру) — завантажуємо в GitHub Releases.
$tag = "v$($release.versionName)"
$assetName = "giraffe-mobile-$($release.versionName)-b$($release.versionCode).apk"
Write-Host "Завантаження APK у GitHub Releases ($tag)..."
$uploadOut = & node (Join-Path $PSScriptRoot "upload-release.mjs") --apk $apkSource --tag $tag --name $assetName --notes "Zhyrafyk v$($release.versionName) (build $($release.versionCode))." 2>&1
$uploadJson = $uploadOut | Where-Object { $_ -match '^\{' } | Select-Object -Last 1
if ($uploadJson) {
  $release.apkUrl = ($uploadJson | ConvertFrom-Json).url
} else {
  Write-Warning "Не вдалося завантажити APK у Releases. Локальний APK збережено, apkUrl не оновлено."
  $uploadOut | ForEach-Object { Write-Host $_ }
}

[System.IO.File]::WriteAllText($releasePath, ($release | ConvertTo-Json -Depth 8), $utf8NoBom)

# Публікуємо маніфест у БД сайту — деплой giraffe-site після релізу не потрібен.
Write-Host "Публікація версії на сайт (БД)..."
$publishOut = & node (Join-Path $PSScriptRoot "publish-version.mjs") --file $releasePath 2>&1
$publishJson = $publishOut | Where-Object { $_ -match '^\{' } | Select-Object -Last 1
if ($publishJson -and ($publishJson | ConvertFrom-Json).ok) {
  Write-Host "Версію опубліковано в БД сайту."
} else {
  Write-Warning "Не вдалося опублікувати версію в БД сайту (перевірте MOBILE_RELEASE_KEY). Реліз у GitHub Releases не залежить від цього."
  $publishOut | ForEach-Object { Write-Host $_ }
}

Write-Host ""
Write-Host "APK: $appRoot\\app-release.apk"
Write-Host "URL: $($release.apkUrl)"
Write-Host "SHA256: $($release.sha256)"
