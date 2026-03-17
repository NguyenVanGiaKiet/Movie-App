export default function StructuredData({ movie, type = 'Movie' }) {
  if (!movie) return null;

  const categories = Array.isArray(movie.category) 
    ? movie.category.map(cat => cat.name || cat).filter(Boolean)
    : [];

  const countries = Array.isArray(movie.country)
    ? movie.country.map(country => country.name || country).filter(Boolean)
    : [];

  const actors = Array.isArray(movie.actor)
    ? movie.actor.map(actor => actor.name || actor).filter(Boolean)
    : [];

  const directors = Array.isArray(movie.director)
    ? movie.director.map(director => director.name || director).filter(Boolean)
    : [];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    name: movie.name,
    alternateName: movie.origin_name,
    description: movie.content?.replace(/<[^>]*>/g, '').trim() || `Xem ${movie.name} online`,
    url: `https://your-domain.com/movie/${movie.slug}`,
    image: movie.poster_url || movie.thumb_url,
    datePublished: movie.year ? `${movie.year}-01-01` : undefined,
    genre: categories,
    contentRating: 'PG-13',
    inLanguage: movie.lang || 'vi',
    countryOfOrigin: countries,
    director: directors.map(name => ({
      '@type': 'Person',
      name,
    })),
    actor: actors.map(name => ({
      '@type': 'Person',
      name,
    })),
    productionCompany: {
      '@type': 'Organization',
      name: 'HopPhim',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'HopPhim',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: movie.rating || '8.0',
      ratingCount: '1000',
      bestRating: '10',
      worstRating: '1',
    },
  };

  // Remove undefined fields
  Object.keys(structuredData).forEach(key => {
    if (structuredData[key] === undefined) {
      delete structuredData[key];
    }
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  );
}
