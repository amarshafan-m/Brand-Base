import React, { useState, useRef, useEffect } from 'react';

interface MediaPlayerProps {
  src: string;
  type: 'audio' | 'video';
  poster?: string;
}

export function MediaPlayer({ src, type, poster }: MediaPlayerProps) {
  const mediaRef = useRef<HTMLMediaElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const isDragging = useRef(false);
  const mouseMoveHandler = useRef<((e: MouseEvent) => void) | null>(null);
  const mouseUpHandler = useRef<(() => void) | null>(null);

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;

    const onTimeUpdate = () => {
      // Don't fight with the user's drag state to avoid jitter
      if (!isDragging.current) {
        setCurrentTime(formatTime(el.currentTime));
        setProgress((el.currentTime / el.duration) * 100 || 0);
      }
    };

    const onLoadedMetadata = () => {
      setDuration(formatTime(el.duration));
    };

    const onEnded = () => {
      setIsPlaying(false);
      if (!isDragging.current) {
        setProgress(0);
        setCurrentTime("0:00");
      }
    };

    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('loadedmetadata', onLoadedMetadata);
    el.addEventListener('ended', onEnded);

    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('loadedmetadata', onLoadedMetadata);
      el.removeEventListener('ended', onEnded);
      
      // CRITICAL FIX: Prevent Adobe CEF from crashing on extension force reload
      // by destroying the active media buffer!
      try {
        el.pause();
        el.removeAttribute('src');
        el.load();
      } catch(err) { console.debug("MediaPlayer cleanup error:", err); }
    };
  }, []);

  const togglePlay = () => {
    if (!mediaRef.current) return;
    if (isPlaying) {
      mediaRef.current.pause();
    } else {
      mediaRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (clientX: number, target: EventTarget & HTMLDivElement) => {
    if (!mediaRef.current) return;
    const bounds = target.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
    mediaRef.current.currentTime = percent * mediaRef.current.duration;
    setProgress(percent * 100);
    setCurrentTime(formatTime(percent * mediaRef.current.duration));
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    handleSeek(e.clientX, e.currentTarget);
    
    const target = e.currentTarget;
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      if (isDragging.current) {
        handleSeek(moveEvent.clientX, target);
      }
    };
    
    const onMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      mouseMoveHandler.current = null;
      mouseUpHandler.current = null;
    };
    
    mouseMoveHandler.current = onMouseMove;
    mouseUpHandler.current = onMouseUp;
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  if (type === 'video') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#000' }}>
        <video 
          ref={mediaRef as React.RefObject<HTMLVideoElement>} 
          src={src} 
          poster={poster}
          style={{ width: '100%', height: 'calc(100% - 50px)', objectFit: 'contain', cursor: 'pointer' }} 
          playsInline
          onClick={togglePlay}
        />
        <div style={{ height: '50px', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '16px', borderTop: '1px solid var(--border)' }}>
          <div onClick={togglePlay} style={{ cursor: 'pointer', display: 'flex', color: 'var(--text-main)', background: 'var(--bg-card)', padding: '10px', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {isPlaying ? (
              <svg className="media-play-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg className="media-play-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            )}
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', minWidth: '40px', fontWeight: 500 }}>{currentTime}</span>
          
          <div 
            onMouseDown={handlePointerDown}
            style={{ flex: 1, height: '24px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '3px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${progress}%`, background: 'var(--primary)', borderRadius: '3px' }}>
                <div style={{ position: 'absolute', right: '-6px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', background: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.5)' }} />
              </div>
            </div>
          </div>
          
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', minWidth: '40px', fontWeight: 500 }}>{duration}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '0 20px', boxSizing: 'border-box' }}>
      <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} src={src} />
      
      {/* Soundwave */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px', marginTop: '16px' }}>
         <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '48px' }}>
           {[0.2, 0.5, 0.8, 1, 0.6, 0.9, 0.4, 0.7, 0.3].map((h, i) => (
             <div key={i} style={{ width: '6px', height: `${(isPlaying ? h : 0.15) * 100}%`, background: 'var(--primary)', borderRadius: '3px', transition: 'height 0.15s ease' }} />
           ))}
         </div>
      </div>
      
      {/* Audio Controls */}
      <div style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '24px', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxSizing: 'border-box', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div onClick={togglePlay} style={{ cursor: 'pointer', display: 'flex', background: 'var(--primary)', padding: '10px', borderRadius: '50%', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
           {isPlaying ? (
             <svg className="media-play-icon" width="14" height="14" viewBox="0 0 24 24" fill="#ffffff"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
           ) : (
             <svg className="media-play-icon" width="14" height="14" viewBox="0 0 24 24" fill="#ffffff"><path d="M8 5v14l11-7z"/></svg>
           )}
        </div>
        
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', minWidth: '40px', fontWeight: 500 }}>{currentTime}</span>
        
        <div 
          onMouseDown={handlePointerDown}
          style={{ flex: 1, height: '24px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '3px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${progress}%`, background: 'var(--primary)', borderRadius: '3px' }}>
              <div style={{ position: 'absolute', right: '-6px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', background: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.5)' }} />
            </div>
          </div>
        </div>
        
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', minWidth: '40px', fontWeight: 500 }}>{duration}</span>
      </div>
    </div>
  );
}
