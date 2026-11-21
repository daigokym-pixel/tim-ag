export const metadata = { title: 'Tim代理店研修', description: 'Tim代理店メンバーの研修サイト' };
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Space+Grotesk:wght@500;700&display=swap" />
        <link rel="stylesheet" href="/app.css" />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
