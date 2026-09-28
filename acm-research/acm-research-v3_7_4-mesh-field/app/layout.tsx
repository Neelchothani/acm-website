import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DJSCE ACM Research',
  description:
    'ACM Research is DJSCE\'s student research chapter - advancing computer science through innovative research across AI, software engineering, cybersecurity, HCI and distributed systems.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
