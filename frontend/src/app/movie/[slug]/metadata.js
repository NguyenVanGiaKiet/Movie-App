import { movieAPI } from '@/lib/api';

export async function generateMetadata({ params }) {
  const { slug } = params;
  
  try {
    // Thêm timeout để tránh treo khi backend chưa chạy
    const res = await Promise.race([
      movieAPI.getMovieBySlug(slug),
      new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), 3000))
    ]);
    
    const movie = res?.data?.movie || res?.data?.film || res?.data;
    
    if (!movie) {
      return {
        title: 'Phim không tồn tại - HopPhim',
        description: 'Không tìm thấy thông tin phim',
      };
    }

    const title = `${movie.name} - ${movie.origin_name || ''} | HopPhim`;
    const description = `${movie.content?.replace(/<[^>]*>/g, '').slice(0, 160) || `Xem ${movie.name} full HD vietsub. ${movie.year ? `Phim năm ${movie.year}` : ''} ${movie.quality || ''}`}`;
    
    const categories = Array.isArray(movie.category) ? movie.category.map(cat => cat.name || cat).join(', ') : '';
    const keywords = `${movie.name}, ${movie.origin_name || ''}, ${categories}, phim hay, xem phim online, ${movie.year || ''}`;

    return {
      title,
      description,
      keywords,
      authors: [{ name: 'HopPhim' }],
      openGraph: {
        title,
        description,
        url: process.env.NODE_ENV === 'development' ? `http://localhost:3000/movie/${slug}` : `https://hopphim.vercel.app/movie/${slug}`,
        siteName: 'HopPhim',
        images: [
          {
            url: movie.poster_url || movie.thumb_url || '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: movie.name,
          },
        ],
        locale: 'vi_VN',
        type: 'video.movie',
        tags: categories.split(', ').filter(Boolean),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [movie.poster_url || movie.thumb_url || '/og-image.jpg'],
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
      alternates: {
        canonical: `/movie/${slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    
    // Return basic metadata if API fails
    return {
      title: `Xem phim online - HopPhim`,
      description: 'Xem phim online miễn phí chất lượng cao tại HopPhim',
      keywords: 'phim online, xem phim, phim hay, phim hd',
      openGraph: {
        title: 'Xem phim online - HopPhim',
        description: 'Xem phim online miễn phí chất lượng cao tại HopPhim',
        url: process.env.NODE_ENV === 'development' ? `http://localhost:3000/movie/${slug}` : `https://hopphim.vercel.app/movie/${slug}`,
        siteName: 'HopPhim',
        images: ['/og-image.jpg'],
        locale: 'vi_VN',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Xem phim online - HopPhim',
        description: 'Xem phim online miễn phí chất lượng cao tại HopPhim',
        images: ['/og-image.jpg'],
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}
