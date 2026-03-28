'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Users } from 'lucide-react';
import { getTMDBDataForMovie, formatScore, getTMDBImage } from '@/lib/tmdb';

export default function TMDBInfo({ movieName, year, className = '', showOnlyScore = false, showOnlyCasts = false, preferredMediaType = null }) {
  const [tmdbData, setTmdbData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movieName) {
      return;
    }

    const fetchTMDBData = async () => {
      setLoading(true);
      
      try {
        const data = await getTMDBDataForMovie(movieName, year, preferredMediaType);
        setTmdbData(data);
      } catch (error) {
        console.error('TMDB fetch error in component:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTMDBData();
  }, [movieName, year]);

  if (loading) {
    if (showOnlyScore) {
      return (
        <div className={`tmdb-score-loading ${className}`}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-8 h-5 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      );
    }
    
    return (
      <div className={`tmdb-info-loading ${className}`}>
        <div className="flex gap-3">
          <div className="w-5 h-5 bg-gray-700 rounded-full animate-pulse"></div>
          <div className="w-8 h-5 bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-3 mt-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="w-12 h-12 bg-gray-700 rounded-full animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!tmdbData) {
    return null;
  }

  if (showOnlyCasts) {
    return (
      <div className={`tmdb-casts-only ${className}`}>
        {tmdbData.casts && tmdbData.casts.length > 0 && (
          <div className="tmdb-casts-section">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-gray-300" />
              <h3 className="text-white font-semibold">Diễn viên</h3>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2">
              {tmdbData.casts.map((cast) => (
                <div key={cast.id} className="flex-shrink-0 text-center">
                  <div className="relative w-16 h-16 mb-1">
                    {cast.profile_path ? (
                      <Image
                        src={cast.profile_path}
                        alt={cast.name}
                        fill
                        className="rounded-full object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-gray-400 text-xs">
                          {cast.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-white text-xs font-medium truncate w-16">
                    {cast.name}
                  </p>
                  {cast.character && (
                    <p className="text-gray-400 text-xs truncate w-16">
                      {cast.character}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (showOnlyScore) {
    return (
      <div className={`tmdb-score-only ${className}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="text-white font-bold text-lg">
              {formatScore(tmdbData.score.vote_average)}
            </span>
            <span className="text-gray-400 text-sm">/10</span>
          </div>
          <span className="text-gray-400 text-sm">
            ({tmdbData.score.vote_count.toLocaleString()} votes)
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`tmdb-info ${className}`}>
      {/* Score Section */}
      <div className="tmdb-score-section mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="text-white font-bold text-lg">
              {formatScore(tmdbData.score.vote_average)}
            </span>
            <span className="text-gray-400 text-sm">/10</span>
          </div>
          <span className="text-gray-400 text-sm">
            ({tmdbData.score.vote_count.toLocaleString()} votes)
          </span>
        </div>
      </div>

      {/* Casts Section */}
      {tmdbData.casts && tmdbData.casts.length > 0 && (
        <div className="tmdb-casts-section">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-gray-300" />
            <h3 className="text-white font-semibold">Diễn viên</h3>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2">
            {tmdbData.casts.map((cast) => (
              <div key={cast.id} className="flex-shrink-0 text-center">
                <div className="relative w-16 h-16 mb-1">
                  {cast.profile_path ? (
                    <Image
                      src={cast.profile_path}
                      alt={cast.name}
                      fill
                      className="rounded-full object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 text-xs">
                        {cast.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-white text-xs font-medium truncate w-16">
                  {cast.name}
                </p>
                {cast.character && (
                  <p className="text-gray-400 text-xs truncate w-16">
                    {cast.character}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
