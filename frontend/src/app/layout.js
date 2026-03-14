import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'HopPhim – Xem phim trực tuyến',
  description: 'Khám phá hàng ngàn bộ phim hay, phim bộ, phim lẻ chất lượng cao',
  keywords: 'phim online, xem phim, phim hay, phim mới',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#0A0A0F] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="bg-dark-surface border-t border-dark-border py-10 mt-20">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="font-display text-3xl text-brand-red tracking-widest mb-3">HOPPHIM</p>
              <p className="text-[#606070] text-sm">© 2024 HopPhim. Dữ liệu từ phim.nguonc.com</p>
            </div>
          </footer>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1A1A22', color: '#F5F5F5', border: '1px solid rgba(255,255,255,0.08)' },
              success: { iconTheme: { primary: '#E50914', secondary: 'white' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
