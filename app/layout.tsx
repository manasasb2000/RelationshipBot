import type { Metadata } from 'next';
import { Providers } from '@/components/providers/theme';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'LoveStory — A little guidance. A lot of heart.', template: '%s | LoveStory' },
  description:
    'A thoughtful space for your relationship journey. Meet your Relationship Guru for conversations about connection, communication, and growing together.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
