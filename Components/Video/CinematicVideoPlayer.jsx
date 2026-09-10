import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PauseIcon, PlayIcon } from '../Icons';
import styles from './CinematicVideoPlayer.module.css';

/**
 * Format seconds into mm:ss
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function CinematicVideoPlayer({
  src = null,
  poster = null,
  title = 'Brand Sizzle Reel',
  subtitle = 'Curated flagship tour & craftsmanship showcase',
  chapters = [],
  duration = 90,
  accentColor = '#2563eb',
  autoPlay = false,
  renderOverlay = null,
  className = '',
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [useMotionCanvas, setUseMotionCanvas] = useState(!src);

  // Active Chapter calculation
  const activeChapterIndex = chapters.reduce((acc, ch, idx) => {
    if (currentTime >= ch.timestamp) return idx;
    return acc;
  }, 0);
  const activeChapter = chapters[activeChapterIndex] || chapters[0];

  // Motion Canvas Animation Loop
  const drawMotionCanvas = useCallback(
    (timestamp) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) return;

      // Clear
      ctx.clearRect(0, 0, width, height);

      // Ambient Cinematic Background
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      if (activeChapterIndex % 2 === 0) {
        bgGrad.addColorStop(0, '#090d16');
        bgGrad.addColorStop(0.5, '#1e1b4b');
        bgGrad.addColorStop(1, '#020617');
      } else {
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(0.5, '#311042');
        bgGrad.addColorStop(1, '#090d16');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient Lighting Sweep (horizontal motion based on timestamp)
      const sweepX = (Math.sin(timestamp * 0.001) * 0.5 + 0.5) * width;
      const lightGrad = ctx.createRadialGradient(
        sweepX,
        height * 0.4,
        20,
        sweepX,
        height * 0.4,
        width * 0.5
      );
      lightGrad.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
      lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, width, height);

      // Vignette Shadow
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.25,
        width / 2,
        height / 2,
        width * 0.75
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // Floating Dust Particles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 15; i++) {
        const px = (i * 73 + timestamp * 0.04) % width;
        const py = (i * 53 + Math.sin(timestamp * 0.002 + i) * 30) % height;
        ctx.beginPath();
        ctx.arc(px, py, (i % 3) + 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Audio Frequency Spectrum Visualizer Bars at the bottom
      const barCount = 36;
      const barWidth = width / (barCount * 1.5);
      ctx.fillStyle = accentColor;
      for (let b = 0; b < barCount; b++) {
        const freqHeight = isPlaying
          ? Math.abs(Math.sin(timestamp * 0.005 + b * 0.4)) * 36 + 6
          : 6;
        const bx = b * (barWidth * 1.5) + width * 0.1;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.roundRect(bx, height - 80 - freqHeight, barWidth, freqHeight, 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // Center Showcase Title & Chapter Marker
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 22px serif';
      ctx.textAlign = 'center';
      ctx.fillText(activeChapter?.title || title, width / 2, height * 0.48);

      ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(
        `CHAPTER ${activeChapterIndex + 1} OF ${chapters.length || 1} • 4K HDR MASTER`,
        width / 2,
        height * 0.48 - 32
      );

      if (activeChapter?.desc || subtitle) {
        ctx.fillStyle = 'rgba(226, 232, 240, 0.75)';
        ctx.font = '12px sans-serif';
        ctx.fillText(
          activeChapter?.desc || subtitle,
          width / 2,
          height * 0.48 + 28
        );
      }
    },
    [
      activeChapter,
      activeChapterIndex,
      chapters.length,
      isPlaying,
      title,
      subtitle,
      accentColor,
    ]
  );

  // Playback timer ticker for motion canvas mode
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying && useMotionCanvas) {
        setCurrentTime((prev) => {
          const next = prev + delta * playbackRate;
          if (next >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }

      if (useMotionCanvas) {
        drawMotionCanvas(now);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, useMotionCanvas, playbackRate, duration, drawMotionCanvas]);

  // Video element event sync (if native video is used)
  const handleTimeUpdate = () => {
    if (videoRef.current && !useMotionCanvas) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  const handleVideoError = () => {
    // Graceful fallback to motion canvas if video URL cannot be streamed
    setUseMotionCanvas(true);
  };

  // Play/Pause toggle
  const togglePlay = () => {
    if (videoRef.current && !useMotionCanvas) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => setUseMotionCanvas(true));
      }
    }
    setIsPlaying((prev) => !prev);
  };

  // Seek Scrubber
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const targetTime = Math.max(0, Math.min(duration, pos * duration));

    setCurrentTime(targetTime);
    if (videoRef.current && !useMotionCanvas) {
      videoRef.current.currentTime = targetTime;
    }
  };

  // Jump to Chapter
  const handleJumpChapter = (ch) => {
    setCurrentTime(ch.timestamp);
    if (videoRef.current && !useMotionCanvas) {
      videoRef.current.currentTime = ch.timestamp;
    }
  };

  // Speed selector
  const handleCycleSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setPlaybackRate(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.playerContainer} ${className}`}
      style={{ '--accent': accentColor }}
    >
      {/* Dynamic Backlight Glow */}
      <div
        className={`${styles.backlightGlow} ${isPlaying ? styles.glowPulse : ''}`}
        aria-hidden="true"
      />

      <div className={styles.videoStage}>
        {/* Native HTML5 Video Element */}
        {!useMotionCanvas && src ? (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            className={styles.videoElement}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            onError={handleVideoError}
            muted={isMuted}
            playsInline
          />
        ) : (
          /* High-FPS Motion Canvas Engine */
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            className={styles.motionCanvas}
            onClick={togglePlay}
            aria-label="Cinematic motion reel stage"
          />
        )}

        {/* Big Center Play Overlay Button when paused */}
        {!isPlaying && (
          <button
            type="button"
            className={styles.centerPlayBtn}
            onClick={togglePlay}
            aria-label="Play video reel"
          >
            <PlayIcon size={32} />
          </button>
        )}

        {/* Interactive Experience Overlay (Shop Hotspots or Mascot Commentary) */}
        {renderOverlay && (
          <div className={styles.experienceOverlayContainer}>
            {renderOverlay({
              currentTime,
              activeChapter,
              activeChapterIndex,
              isPlaying,
              onJumpChapter: handleJumpChapter,
            })}
          </div>
        )}

        {/* Glassmorphic Control Deck */}
        <div className={styles.controlDeck}>
          {/* Chapter Scrubber Bar */}
          <div
            className={styles.scrubberContainer}
            onClick={handleSeek}
            role="slider"
            aria-label="Video timeline scrubber"
            aria-valuenow={currentTime}
            aria-valuemin={0}
            aria-valuemax={duration}
            tabIndex={0}
          >
            <div className={styles.scrubberTrack}>
              <div
                className={styles.scrubberProgress}
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />

              {/* Chapter Timeline Markers */}
              {chapters.map((ch, idx) => {
                const pct = (ch.timestamp / duration) * 100;
                return (
                  <button
                    key={ch.timestamp}
                    type="button"
                    className={`${styles.chapterMarker} ${
                      currentTime >= ch.timestamp
                        ? styles.chapterMarkerReached
                        : ''
                    }`}
                    style={{ left: `${pct}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJumpChapter(ch);
                    }}
                    title={`Chapter ${idx + 1}: ${ch.title}`}
                    aria-label={`Jump to Chapter ${idx + 1}: ${ch.title}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Controls Bar Row */}
          <div className={styles.controlsRow}>
            <div className={styles.controlsLeft}>
              {/* Play / Pause */}
              <button
                type="button"
                className={styles.iconBtn}
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
              </button>

              {/* Time Display */}
              <div className={styles.timeDisplay}>
                <span className={styles.currentTimeText}>
                  {formatTime(currentTime)}
                </span>
                <span className={styles.timeDivider}>/</span>
                <span className={styles.totalTimeText}>
                  {formatTime(duration)}
                </span>
              </div>

              {/* Chapter Dropdown / Label */}
              {chapters.length > 0 && (
                <div className={styles.activeChapterBadge}>
                  <span className={styles.badgePulseDot} />
                  <span>{activeChapter?.title || 'Main Feature'}</span>
                </div>
              )}
            </div>

            <div className={styles.controlsRight}>
              {/* Playback Speed */}
              <button
                type="button"
                className={styles.speedBtn}
                onClick={handleCycleSpeed}
                title="Change playback speed"
                aria-label={`Playback speed ${playbackRate}x`}
              >
                {playbackRate}x
              </button>

              {/* Audio Mute/Unmute */}
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setIsMuted((prev) => !prev)}
                aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>

              {/* Fullscreen */}
              <button
                type="button"
                className={styles.iconBtn}
                onClick={toggleFullscreen}
                aria-label={
                  isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
                }
              >
                {isFullscreen ? '⤢' : '⤡'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

CinematicVideoPlayer.propTypes = {
  src: PropTypes.string,
  poster: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  chapters: PropTypes.arrayOf(
    PropTypes.shape({
      timestamp: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      desc: PropTypes.string,
    })
  ),
  duration: PropTypes.number,
  accentColor: PropTypes.string,
  autoPlay: PropTypes.bool,
  renderOverlay: PropTypes.func,
  className: PropTypes.string,
};
