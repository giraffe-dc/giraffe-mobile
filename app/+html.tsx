import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Кореневий HTML-шел для web-експорту (PWA).
 * Тут живуть PWA/Apple-метатеги, маніфест і реєстрація service worker —
 * вони потрібні, щоб iPhone міг «Додати на головний екран» у режимі standalone.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="uk">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta
          name="description"
          content="Каталог свят, розрахунок вартості, бронювання й контакти команди «Жирафик»."
        />

        {/* PWA */}
        <meta name="theme-color" content="#1E5B3F" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" type="image/png" href="/icons/favicon.png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

        {/* iOS: запуск із головного екрана без Safari */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Жирафик" />
        <meta name="format-detection" content="telephone=no" />

        <ScrollViewStyleReset />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker.register('/sw.js').catch(function () {});
                });
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
