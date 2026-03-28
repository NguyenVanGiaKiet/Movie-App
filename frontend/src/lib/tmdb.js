// TMDB API helper functions

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// Tìm kiếm phim trên TMDB để lấy ID (hỗ trợ cả movie và tv)
export async function searchMovieOnTMDB(movieName, year = null, preferredMediaType = null) {
  if (!TMDB_API_KEY) {
    return null;
  }

  try {
    const query = new URLSearchParams({
      api_key: TMDB_API_KEY,
      query: movieName,
      language: 'vi-VN',
      include_adult: false,
      year: year
    });

    let url, response, data;
    
    // Nếu có preferredMediaType, chỉ tìm kiếm loại đó
    if (preferredMediaType === 'movie') {
      url = `${TMDB_BASE_URL}/search/movie?${query}`;
      response = await fetch(url);
      data = await response.json();
    } else if (preferredMediaType === 'tv') {
      url = `${TMDB_BASE_URL}/search/tv?${query}`;
      response = await fetch(url);
      data = await response.json();
    } else {
      // Không có preferredMediaType, thử cả hai
      // Thử tìm kiếm movie trước
      url = `${TMDB_BASE_URL}/search/movie?${query}`;
      response = await fetch(url);
      data = await response.json();
      
      // Nếu không tìm thấy movie, thử tìm kiếm TV series
      if (!data.results?.[0]) {
        url = `${TMDB_BASE_URL}/search/tv?${query}`;
        response = await fetch(url);
        data = await response.json();
      }
    }
    
    // Thêm media_type vào kết quả
    if (data.results?.[0]) {
      data.results[0].media_type = preferredMediaType || (url.includes('/tv') ? 'tv' : 'movie');
    }
    
    return data.results?.[0] || null;
  } catch (error) {
    console.error('TMDB search error:', error);
    return null;
  }
}

// Lấy chi tiết phim từ TMDB (hỗ trợ cả movie và tv)
export async function getMovieDetailsFromTMDB(tmdbId, mediaType = 'movie') {
  if (!TMDB_API_KEY || !tmdbId) return null;

  try {
    const query = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: 'vi-VN',
      append_to_response: mediaType === 'tv' ? 'aggregate_credits,videos,images' : 'credits,videos,images'
    });

    const url = `${TMDB_BASE_URL}/${mediaType}/${tmdbId}?${query}`;
    const response = await fetch(url);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('TMDB details error:', error);
    return null;
  }
}

// Lấy casts từ TMDB
export function getCastFromTMDB(tmdbData) {
  // TV series dùng aggregate_credits, movie dùng credits
  const credits = tmdbData.aggregate_credits || tmdbData.credits;

  if (!credits?.cast) {
    return [];
  }
  
  const cast = credits.cast
    .slice(0, 8)
    .map(person => ({
      name: person.name,
      character: person.character,
      profile_path: person.profile_path ? `${TMDB_IMAGE_BASE}${person.profile_path}` : null,
      id: person.id
    }));
  
  return cast;
}

// Lấy score từ TMDB
export function getScoreFromTMDB(tmdbData) {
  return {
    vote_average: tmdbData?.vote_average || 0,
    vote_count: tmdbData?.vote_count || 0,
    popularity: tmdbData?.popularity || 0
  };
}

// Format score display
export function formatScore(score) {
  if (!score) return 'N/A';
  return score.toFixed(1);
}

// Get TMDB image URL
export function getTMDBImage(path, size = 'w500') {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// Helper function để test search patterns
export function testSearchPatterns(movieName) {
  const patterns = {
    original: movieName,
    english: movieName.split(':')[0].split('(')[0].trim(),
    simple: movieName.split(':')[0].trim(),
    baseName: movieName
      .replace(/season\s*\d+/gi, '')
      .replace(/part\s*\d+/gi, '')
      .replace(/\s*\d+/gi, '')
      .replace(/phần\s*\d+/gi, '')
      .trim()
  };
  
  return patterns;
}

// Helper function để detect media type từ movie data
export function detectMediaType(movie) {
  // Kiểm tra các dấu hiệu của TV series
  const hasEpisodes = movie.episode_current && movie.episode_total && 
    (movie.episode_current !== 'Full' && movie.episode_total !== '1');
  
  const hasTimeInTaps = movie.time?.includes('tập');
  const hasMultipleEpisodes = movie.episode_total && 
    parseInt(movie.episode_total) > 1;
  
  const isTV = hasEpisodes || hasTimeInTaps || hasMultipleEpisodes;
  
  console.log('🔍 Media Type Detection:', {
    movieName: movie.name,
    episode_current: movie.episode_current,
    episode_total: movie.episode_total,
    time: movie.time,
    hasEpisodes,
    hasTimeInTaps,
    hasMultipleEpisodes,
    isTVSeries: isTV,
    detectedType: isTV ? 'tv' : 'movie'
  });
  
  // Mặc định là movie
  return isTV ? 'tv' : 'movie';
}

// Combined function để lấy TMDB data cho một phim (hỗ trợ cả movie và tv)
export async function getTMDBDataForMovie(movieName, year = null, preferredMediaType = null) {
  console.log('🚀 TMDB Search Start:', { movieName, year, preferredMediaType });
  
  // 1. Tìm kiếm phim với tên gốc
  let searchResult = await searchMovieOnTMDB(movieName, year, preferredMediaType);
  console.log('📝 Search 1 (original):', !!searchResult?.id ? 'FOUND' : 'NOT FOUND');
  
  // 2. Nếu không tìm thấy, thử với tên tiếng Anh (loại bỏ phần phụ đề)
  if (!searchResult?.id) {
    const englishName = movieName.split(':')[0].split('(')[0].trim();
    console.log('📝 Search 2 (english):', englishName);
    console.log('📝 English name length:', englishName.length);
    console.log('📝 English name chars:', Array.from(englishName));
    
    searchResult = await searchMovieOnTMDB(englishName, year, preferredMediaType);
    console.log('📝 Search 2 result:', !!searchResult?.id ? 'FOUND' : 'NOT FOUND');
    
    // Thử với tên hardcoded nếu là Howl's Moving Castle
    if (!searchResult?.id && englishName.includes("Howl")) {
      console.log('📝 Search 2b (hardcoded): Howl\'s Moving Castle');
      searchResult = await searchMovieOnTMDB("Howl's Moving Castle", year, preferredMediaType);
      console.log('📝 Search 2b result:', !!searchResult?.id ? 'FOUND' : 'NOT FOUND');
    }
  }
  
  // 3. Nếu vẫn không tìm thấy, thử với tên đơn giản hơn
  if (!searchResult?.id) {
    const simpleName = movieName.split(':')[0].trim();
    console.log('📝 Search 3 (simple):', simpleName);
    searchResult = await searchMovieOnTMDB(simpleName, year, preferredMediaType);
    console.log('📝 Search 3 result:', !!searchResult?.id ? 'FOUND' : 'NOT FOUND');
  }
  
  // 4. Nếu có số (season 2, part 2, etc), thử tìm base name
  if (!searchResult?.id) {
    const baseName = movieName
      .replace(/season\s*\d+/gi, '')           // "Arcane Season 2" -> "Arcane"
      .replace(/part\s*\d+/gi, '')             // "Arcane Part 2" -> "Arcane"  
      .replace(/\s*\d+/gi, '')                 // "Arcane 2" -> "Arcane"
      .replace(/phần\s*\d+/gi, '')             // "Arcane Phần 2" -> "Arcane"
      .trim();
    
    if (baseName !== movieName) {
      console.log('📝 Search 4 (base name):', baseName);
      searchResult = await searchMovieOnTMDB(baseName, year, preferredMediaType);
      console.log('📝 Search 4 result:', !!searchResult?.id ? 'FOUND' : 'NOT FOUND');
    }
  }
  
  if (!searchResult?.id) {
    console.log('❌ All TMDB searches failed');
    return null;
  }

  console.log('✅ TMDB Search Success:', { 
    id: searchResult.id, 
    title: searchResult.title || searchResult.name,
    mediaType: searchResult.media_type
  });

  // 5. Lấy chi tiết đầy đủ với đúng media_type
  const mediaType = searchResult.media_type || preferredMediaType || 'movie';
  const details = await getMovieDetailsFromTMDB(searchResult.id, mediaType);
  if (!details) {
    console.log('❌ TMDB details failed');
    return null;
  }

  const result = {
    id: details.id,
    title: details.title || details.name, // TV series dùng 'name'
    overview: details.overview,
    release_date: details.release_date || details.first_air_date, // TV series dùng 'first_air_date'
    score: getScoreFromTMDB(details),
    casts: getCastFromTMDB(details),
    poster_path: getTMDBImage(details.poster_path),
    backdrop_path: getTMDBImage(details.backdrop_path, 'w1280'),
    genres: details.genres || [],
    runtime: details.runtime, // TV series có thể không có runtime
    videos: details.videos?.results || [],
    media_type: mediaType // Thêm media_type để debug
  };

  console.log('🎯 TMDB Final Result:', {
    title: result.title,
    hasScore: !!result.score?.vote_average,
    scoreValue: result.score?.vote_average,
    castCount: result.casts.length,
    mediaType: result.media_type
  });

  return result;
}
