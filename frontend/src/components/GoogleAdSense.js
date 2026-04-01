'use client';

import { useEffect } from 'react';

export default function GoogleAdSense() {
  useEffect(() => {
    // Chỉ load AdSense script một lần
    if (!window.adsbygoogle) {
      window.adsbygoogle = [];
      
      // Load AdSense script
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9123438903601975';
      script.crossOrigin = 'anonymous';
      script.async = true;
      
      script.onload = () => {
        // Chỉ khởi tạo page-level ads một lần
        if (window.adsbygoogle.length === 0) {
          (adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: "ca-pub-9123438903601975",
            enable_page_level_ads: true
          });
        }
      };
      
      document.head.appendChild(script);
    }
  }, []);

  return null; // Component không render gì cả
}
