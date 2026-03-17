import { movieAPI } from '@/lib/api';

export async function generateMetadata({ params }) {
  const { slug } = params;
  
  try {
    const res = await movieAPI.getMovieBySlug(slug);
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
        url: `https://hopphim.vercel.app/movie/${slug}`,
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
    return {
      title: 'Phim - HopPhim',
      description: 'Xem phim online miễn phí tại HopPhim',
    };
  }
}
