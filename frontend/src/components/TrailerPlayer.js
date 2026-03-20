'use client';

import { useState, useRef, useEffect } from 'react';

export default function TrailerPlayer({ trailerUrl, isActive, onEnded, isMuted, setIsMuted }) {
  const playerRef         = useRef(null);
  const playerInstanceRef = useRef(null);
  const mountedRef        = useRef(true);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|v\/|embed\/|watch\?v=|&v=)([^#&?]{11})/);
    return m ? m[1] : null;
  };

  const videoId = getYouTubeId(trailerUrl);

  const initPlayer = () => {
    if (!playerRef.current || !window.YT || !mountedRef.current) return;

    // Destroy existing instance first (ensures restart from beginning)
    if (playerInstanceRef.current) {
      try { playerInstanceRef.current.destroy(); } catch {}
      playerInstanceRef.current = null;
    }

    playerInstanceRef.current = new window.YT.Player(playerRef.current, {
      videoId,
      playerVars: {
        autoplay:        1,
        mute:            isMuted ? 1 : 0,
        controls:        0,
        rel:             0,
        showinfo:        0,
        modestbranding:  1,
        loop:            1,
        playlist:        videoId,
        playsinline:     1,
        disablekb:       1,
        fs:              0,
        cc_load_policy:  0,
        iv_load_policy:  3,
        origin:          typeof window !== 'undefined' ? window.location.origin : '',
      },
      events: {
        onReady: (event) => {
          if (!mountedRef.current) return;
          event.target.playVideo();
          if (!isMuted) {
            try { event.target.unMute(); event.target.setVolume(50); }
            catch { setIsMuted(true); }
          }
        },
        onStateChange: (event) => {
          if (!mountedRef.current) return;
          if (event.data === window.YT.PlayerState.ENDED && onEnded) onEnded();
        },
      },
    });
  };

  // Load / reload player when isActive or videoId changes
  useEffect(() => {
    mountedRef.current = true;

    if (!videoId || !isActive) {
      // Destroy player when not active (scroll away / tab switch)
      if (playerInstanceRef.current) {
        try { playerInstanceRef.current.destroy(); } catch {}
        playerInstanceRef.current = null;
      }
      return;
    }

    if (!window.YT) {
      // Inject API once
      if (!document.getElementById('yt-api-script')) {
        const tag = document.createElement('script');
        tag.id  = 'yt-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      // API already loaded — small delay to let the div re-render
      setTimeout(initPlayer, 100);
    }

    return () => {
      mountedRef.current = false;
      if (playerInstanceRef.current) {
        try { playerInstanceRef.current.destroy(); } catch {}
        playerInstanceRef.current = null;
      }
    };
  }, [videoId, isActive]); // eslint-disable-line

  // Sync mute state without reinitialising
  useEffect(() => {
    const p = playerInstanceRef.current;
    if (!p) return;
    try {
      isMuted ? p.mute() : p.unMute();
    } catch {}
  }, [isMuted]);

  if (!videoId) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
      <div
        ref={playerRef}
        style={{
          position:  'fixed',
          top:       '50%',
          left:      '50%',
          transform: 'translate(-50%, -50%) scale(1.2)',
          width:     '100vw',
          height:    '100vh',
          minWidth:  '120vw',
          minHeight: '120vh',
          zIndex:    1,
        }}
      />
      {/* Overlay gradients */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
        <div className="hero-abs hero-grad-r" />
        <div className="hero-abs hero-grad-l" />
        <div className="hero-abs hero-grad-b" />
        <div className="hero-abs hero-grad-t" />
        <div className="hero-abs hero-grid-overlay" />
      </div>
    </div>
  );
}