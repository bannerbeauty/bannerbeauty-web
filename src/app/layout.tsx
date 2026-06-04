import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'BannerBeauty - Building Patriotic Neighborhoods',
  description:
    'BannerBeauty connects neighbors through patriotic banner bumps — send a letter, flag, or gift certificate to honor a fellow American.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          :root {
            --bb-navy: #1B2A4A;
            --bb-red: #B22234;
            --bb-red-dark: #8B1A27;
            --bb-gold: #C5A028;
            --bb-cream: #FAF7F2;
            --bb-green: #1B7A3E;
            --bb-gray-text: #666666;
            --bb-gray-label: #888888;
            --bb-border: #DDDDDD;
            --font-serif: Georgia, 'Times New Roman', serif;
            --font-sans: 'Trebuchet MS', Arial, sans-serif;
          }

          *, *::before, *::after { box-sizing: border-box; }

          html, body {
            margin: 0;
            padding: 0;
            min-height: 100%;
          }

          body {
            font-family: var(--font-serif);
            background-color: var(--bb-cream);
            color: #2D2D2D;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
          }

          main { flex: 1; }
        `}</style>
      </head>
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
