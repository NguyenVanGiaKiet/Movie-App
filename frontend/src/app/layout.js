import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import GoogleAnalytics from '@/components/GoogleAnalytics';

export const metadata = {
  title: 'HopPhim – Phim hay cả hộp',
  description: 'Khám phá hàng ngàn bộ phim hay, phim bộ, phim lẻ chất lượng cao. Xem phim online miễn phí với chất lượng HD.',
  keywords: 'phim online, xem phim, phim hay, phim mới, phim bộ, phim lẻ, phim hd, xem phim miễn phí',
  authors: [{ name: 'HopPhim' }],
  verification: {
    google: 'xqmpJ9LHdg2xENneWqpbV2PS9Zv0KGwEjB6hz79hexs',
  },
  openGraph: {
    title: 'HopPhim – Phim hay cả hộp',
    description: 'Khám phá hàng ngàn bộ phim hay, phim bộ, phim lẻ chất lượng cao. Xem phim online miễn phí với chất lượng HD.',
    url: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://hopphim.vercel.app/',
    siteName: 'HopPhim',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'HopPhim - Xem phim online',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HopPhim – Phim hay cả hộp',
    description: 'Khám phá hàng ngàn bộ phim hay, phim bộ, phim lẻ chất lượng cao. Xem phim online miễn phí với chất lượng HD.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* ✅ AdSense script chuẩn */}
  <script
    async
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9123438903601975"
    crossOrigin="anonymous"
  ></script>
      </head>
      <body className="min-h-screen bg-[#181820] text-white debug-bg" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="bg-dark-surface border-t border-dark-border py-10 mt-20">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="font-display text-3xl text-brand-red tracking-widest mb-3">HopPhim</p>
              <p className="text-[#606070] text-sm">© 2024 HopPhim. Dữ liệu từ phim.nguonc.com</p>
            </div>
          </footer>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#2A2A38', color: '#F5F5F5', border: '1px solid rgba(255,255,255,0.08)' },
              success: { iconTheme: { primary: '#E50914', secondary: 'white' } },
            }}
          />
        </AuthProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
