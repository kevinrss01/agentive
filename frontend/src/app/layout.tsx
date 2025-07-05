import '@/styles/tailwind.css';
import type { Metadata } from 'next';
import { Providers } from '@/components/app/providers';

export const metadata: Metadata = {
  title: {
    template: '%s - Agentive',
    default: 'Agentive - Close every deal',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/css?f%5B%5D=switzer@400,500,600,700&amp;display=swap"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="The Agentive Blog"
          href="/blog/feed.xml"
        />
      </head>
      <body className="text-gray-950 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
