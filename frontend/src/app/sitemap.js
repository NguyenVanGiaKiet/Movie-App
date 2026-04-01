import { movies } from '@/lib/api';
import axios from 'axios';

export default async function sitemap() {
  const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://hopphim.vercel.app';

  try {
    console.log('🗺️ Generating sitemap...');
    
    // Direct API call bypass interceptor with longer timeout
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000/api/films/phim-moi-cap-nhat'
      : 'https://movie-app-5eq7.onrender.com/api/films/phim-moi-cap-nhat';
      
    const response = await Promise.race([
      axios.get(apiUrl, { timeout: 10000 }), // Increased timeout to 10s
      new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout after 10s')), 10000))
    ]);
    
    console.log('📡 API Response status:', response.status);
    console.log('📊 API Response data type:', typeof response.data);
    
    const movieList = response?.data?.items || response?.data?.data?.items || response?.data?.items || response?.data || [];
    console.log('🎬 Total movies found:', movieList.length);

    if (movieList.length === 0) {
      console.log('⚠️ No movies found in API response');
      throw new Error('No movies in API response');
    }

    // Thêm URLs phim - tăng lên 1000 phim
    const movieUrls = movieList.slice(0, 1000).map((movie, index) => ({
      url: `${baseUrl}/movie/${movie.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    }));

    console.log('🔗 Generated movie URLs:', movieUrls.length);

    const sitemapData = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      },
      // Thêm các trang loại phim
      {
        url: `${baseUrl}/movies/type/phim-le`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/movies/type/phim-bo`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/movies/type/hoat-hinh`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/movies/type/tv-shows`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/phim-le`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/phim-bo`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/hoat-hinh`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/tv-shows`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      ...movieUrls, // Thêm 1000 URLs phim
    ];

    console.log('📋 Total sitemap URLs:', sitemapData.length);
    return sitemapData;
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
    
    // Return basic sitemap if API fails
    console.log('🔄 Returning fallback sitemap');
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/movies/type/phim-le`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/movies/type/phim-bo`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/movies/type/hoat-hinh`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/phim-le`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/phim-bo`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/hoat-hinh`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/tv-shows`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
    ];
  }
}
