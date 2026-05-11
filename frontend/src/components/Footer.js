'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-white overflow-hidden">
      {/* Giant Brand Text */}
      <div className="relative mt-8 w-full overflow-hidden">
        <p
          className="text-[clamp(80px,15vw,200px)] font-black leading-none tracking-tighter uppercase whitespace-nowrap text-[#CC1A1A] select-none px-4 w-full text-center"
          style={{ fontFamily: 'Impact, "Arial Narrow", Arial, sans-serif', letterSpacing: '-0.03em' }}
        >
          HOP PHIM
        </p>
      </div>

      {/* Bottom Bar */}
      <div className="">
        {/* Social + Region Row */}
        <div className="max-w-[1480px] mx-auto px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Follow Us */}
          <div className="flex items-center gap-5">
            <span className="text-xs font-black tracking-widest uppercase text-white">Theo Dõi</span>
            {[
              {
                label: 'Facebook',
                href: 'https://facebook.com',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                ),
              },
              {
                label: 'X (Twitter)',
                href: 'https://x.com',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 4l16 16M20 4L4 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  </svg>
                ),
              },
              {
                label: 'Instagram',
                href: 'https://instagram.com',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                ),
              },
              {
                label: 'YouTube',
                href: 'https://youtube.com',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="black" />
                  </svg>
                ),
              },
              {
                label: 'TikTok',
                href: 'https://tiktok.com',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.35 6.35 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.79a4.85 4.85 0 0 1-1.01-.1z" />
                  </svg>
                ),
              },
            ].map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="text-white hover:text-red-400 transition-colors duration-200 border border-white/30 rounded-full w-9 h-9 flex items-center justify-center hover:border-red-500"
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Region + Language */}
          <div className="flex items-center gap-2">
            <select className="bg-[#2a2a2a] text-white text-xs font-bold tracking-widest uppercase border border-white/20 rounded px-3 py-2 appearance-none cursor-pointer hover:border-white/50 transition-colors">
              <option>Việt Nam (VN)</option>
              <option>United States (USA)</option>
              <option>Japan (JP)</option>
            </select>
            <select className="bg-[#2a2a2a] text-white text-xs font-bold tracking-widest uppercase border border-white/20 rounded px-3 py-2 appearance-none cursor-pointer hover:border-white/50 transition-colors">
              <option>VI</option>
              <option>EN</option>
            </select>
          </div>
        </div>

        {/* Legal Row */}
        <div className="max-w-[1480px] mx-auto px-8 pb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-bold tracking-widest uppercase text-white/60">
            © HopPhim
          </p>
          <div className="flex flex-wrap items-center gap-6">
            {['Chính Sách Bảo Mật', 'Điều Khoản Sử Dụng', 'Thỏa Thuận Người Dùng', 'Bản Quyền'].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-xs font-bold tracking-widest uppercase text-white/60 hover:text-white transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}