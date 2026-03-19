'use client';

import { useState, useRef, useEffect } from 'react';

export default function TrailerPlayer({ trailerUrl, isActive, onEnded, isMuted, setIsMuted }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null);

  // Extract YouTube video ID from URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(trailerUrl);

  useEffect(() => {
    if (!videoId || !isActive) return;

    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }
    };
  }, [videoId, isActive]);

  // Handle mute/unmute
  useEffect(() => {
    if (playerInstanceRef.current && playerInstanceRef.current.mute !== undefined) {
      if (isMuted) {
        playerInstanceRef.current.mute();
      } else {
        playerInstanceRef.current.unMute();
      }
    }
  }, [isMuted]);

  const initPlayer = () => {
    if (!playerRef.current || !window.YT) {
      return;
    }
    
    playerInstanceRef.current = new window.YT.Player(playerRef.current, {
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        mute: isMuted ? 1 : 0, // Set initial mute state
        controls: 0, // Hide controls
        rel: 0,
        showinfo: 0,
        modestbranding: 1,
        loop: 1,
        playlist: videoId, // Required for loop
        playsinline: 1,
        autohide: 1,
        disablekb: 1,
        fs: 0, // Disable fullscreen button
        cc_load_policy: 0,
        iv_load_policy: 3,
        // Full screen settings
        wmode: 'transparent',
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => {
          event.target.playVideo();
          setIsPlaying(true);
          
          // Try to unmute immediately if not muted
          if (!isMuted) {
            try {
              event.target.unMute();
              // Also set volume to a reasonable level
              event.target.setVolume(50);
            } catch (error) {
              // Browser blocked, keep muted
              setIsMuted(true);
            }
          }
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            if (onEnded) onEnded();
          }
        },
        onError: (event) => {
          // Handle YouTube errors silently
        },
      },
    });
  };

  if (!videoId) return null;

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <div
        ref={playerRef}
        className="w-full h-full"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(1.2)',
          width: '100vw',
          height: '100vh',
          minWidth: '120vw',
          minHeight: '120vh',
          zIndex: 1,
        }}
      />
      {/* Overlay gradients for content readability */}
      <div 
        className="fixed inset-0 pointer-events-none" 
        style={{ zIndex: 2 }}
      >
        <div className="hero-abs hero-grad-r" />
        <div className="hero-abs hero-grad-l" />
        <div className="hero-abs hero-grad-b" />
        <div className="hero-abs hero-grad-t" />
        <div className="hero-abs hero-grid-overlay" />
      </div>
    </div>
  );
}
