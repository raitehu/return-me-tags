import './globals.css';
import type { Metadata } from 'next';
import { Noto_Sans_JP, Noto_Serif_JP, Sawarabi_Mincho } from 'next/font/google';

const notoSerifJp = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-serif-jp',
});

const notoSansJp = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
});

const sawarabiMincho = Sawarabi_Mincho({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sawarabi-mincho',
});

const siteUrl = 'https://returnmetags.raitehu.com';
const siteTitle = 'ReturnMeTags! by Raitehu';
const siteDescription = 'お名前と連絡先を入力するだけで、L版サイズの迷子タグシートをブラウザ上で手軽に作成できます。ネットプリントでシールに印刷すれば、持ち物に貼れる安心タグがすぐ完成します。';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: '/',
    siteName: siteTitle,
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${notoSerifJp.className} ${notoSansJp.variable} ${sawarabiMincho.variable}`}>
        {children}
      </body>
    </html>
  );
}
