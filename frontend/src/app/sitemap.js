import { movies } from '@/lib/api';

export default async function sitemap() {
  const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://hopphim.vercel.app';

  try {
    // Lấy danh sách phim từ API với timeout
    const response = await Promise.race([
      movies.getMovies(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), 5000))
    ]);
    
    const movieList = response?.data?.data || [];

    const movieUrls = movieList.slice(0, 100).map((movie) => ({
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
      ...movieUrls,
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
    ];
  }
}
