import { movies } from '@/lib/api';
import axios from 'axios';

export default async function sitemap() {
  const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://hopphim.vercel.app';

  try {
    // Direct API call bypass interceptor
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000/api/films/phim-moi-cap-nhat'
      : 'https://movie-app-5eq7.onrender.com/api/films/phim-moi-cap-nhat';
      
    const response = await Promise.race([
      axios.get(apiUrl),
      new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), 5000))
    ]);
    
    // Debug: log response structure
    console.log('API Response:', JSON.stringify(response.data, null, 2).substring(0, 500));
    
    const movieList = response?.data?.items || response?.data?.data?.items || response?.data?.items || response?.data || [];
    console.log('Movie list length:', movieList.length);

    // Thêm nhiều URLs phim hơn
    const movieUrls = movieList.slice(0, 500).map((movie) => ({
      url: `${baseUrl}/movie/${movie.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

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
        url: `${baseUrl}/login`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.3,
      },
      {
        url: `${baseUrl}/register`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.3,
      },
      {
        url: `${baseUrl}/favorites`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
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
      // Thêm các trang direct
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
      ...movieUrls, // Thêm 500 URLs phim
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return basic sitemap if API fails
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
      // Thêm các trang loại phim cơ bản
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
        priority:  0.8,
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
