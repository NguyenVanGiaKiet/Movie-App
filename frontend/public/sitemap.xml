import { movies } from '@/lib/api';

export default async function sitemap() {
  const baseUrl = 'https://hopphim.vercel.app';

  // Lấy danh sách phim từ API
  try {
    const response = await movies.getMovies();
    const movieList = response.data.data || [];

    const movieUrls = movieList.map((movie) => ({
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
    ];
  }
}
