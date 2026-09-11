/**
 * Custom Client-Side Telemetry & Bot Detection Engine
 *
 * Collects privacy-respecting behavioral signals and browser environment heuristics
 * to distinguish genuine human shopper traffic from scrapers, crawlers, and headless bots.
 *
 * Performance-first architecture: Advanced behavioral tactics (mouse movements, continuous
 * scroll depth, click coordinates, keystroke timings) are turned OFF by default to eliminate
 * DOM/CPU overhead. Toggles and presets can be enabled on-demand via the Admin Heatmap HUD.
 */

import { setTrafficClassification } from './google';

const BOT_SCORE_THRESHOLD = 50;

export const DEFAULT_TELEMETRY_SETTINGS = {
  enabled: true, // Master collection toggle
  trackMouseMoves: false, // Pointer movement tracking (OFF by default for CPU performance)
  trackScrollDepth: false, // Viewport scroll depth tracking (OFF by default for smooth scrolling)
  trackClickCoords: false, // Click (x, y) coordinates & element logging (OFF by default)
  trackTypingCadence: false, // Keypress timing delta profiler (OFF by default)
  botDetection: true, // Lightweight static environment & webdriver checks (ON by default)
  privacyMasking: true, // Redact input values & private text from event traces (ON by default)
};

export const TELEMETRY_PRESETS = {
  performance: {
    id: 'performance',
    label: 'Performance Safe',
    description:
      'All continuous listeners dormant. Zero CPU, scroll, or DOM overhead.',
    settings: {
      enabled: true,
      trackMouseMoves: false,
      trackScrollDepth: false,
      trackClickCoords: false,
      trackTypingCadence: false,
      botDetection: true,
      privacyMasking: true,
    },
  },
  diagnostic: {
    id: 'diagnostic',
    label: 'Full Diagnostic',
    description:
      'All behavioral tactics active for comprehensive bot profiling and UX auditing.',
    settings: {
      enabled: true,
      trackMouseMoves: true,
      trackScrollDepth: true,
      trackClickCoords: true,
      trackTypingCadence: true,
      botDetection: true,
      privacyMasking: true,
    },
  },
  heatmapOnly: {
    id: 'heatmapOnly',
    label: 'Heatmap Only',
    description:
      'Click coordinate capture active without pointer jitter or scroll listener overhead.',
    settings: {
      enabled: true,
      trackMouseMoves: false,
      trackScrollDepth: false,
      trackClickCoords: true,
      trackTypingCadence: false,
      botDetection: true,
      privacyMasking: true,
    },
  },
};

class TelemetryEngine {
  constructor() {
    this.sessionId = null;
    this.startTime = null;
    this.botScore = 0;
    this.detectionFlags = {};
    this.interactionCounts = {
      clicks: 0,
      scrolls: 0,
      mouseMoves: 0,
      keystrokes: 0,
      touches: 0,
    };
    this.maxScrollDepth = 0;
    this.honeypotTriggered = false;
    this.isInitialized = false;
    this.lastKeydownTime = 0;
    this.typingDeltas = [];
    this.clickEvents = [];
    this.mouseMoveSampleCount = 0;
    this.persistTimer = null;
    this.settings = { ...DEFAULT_TELEMETRY_SETTINGS };
    this.listeners = {
      mouseMove: null,
      scroll: null,
      click: null,
      touch: null,
      keyDown: null,
      keyUp: null,
      visibility: null,
    };
  }

  loadSettings() {
    if (typeof window === 'undefined') return { ...DEFAULT_TELEMETRY_SETTINGS };
    try {
      const stored = localStorage.getItem('cart_telemetry_settings');
      if (stored) {
        return { ...DEFAULT_TELEMETRY_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // Storage access error fallback
    }
    return { ...DEFAULT_TELEMETRY_SETTINGS };
  }

  init({ autoClassifyGA = true, settings = null } = {}) {
    if (typeof window === 'undefined' || this.isInitialized) return;
    this.isInitialized = true;
    this.startTime = Date.now();
    this.sessionId = this.generateSessionId();
    this.settings = settings
      ? { ...DEFAULT_TELEMETRY_SETTINGS, ...settings }
      : this.loadSettings();

    if (this.settings.enabled && this.settings.botDetection) {
      this.runEnvironmentChecks();
    }

    this.syncListeners();

    if (autoClassifyGA) {
      // Delay classification slightly to capture initial interaction signals
      setTimeout(() => {
        const classification = this.getClassification();
        setTrafficClassification(classification);
      }, 2500);
    }

    // Flush telemetry beacon on page unload / hide
    this.listeners.visibility = () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    };
    window.addEventListener('visibilitychange', this.listeners.visibility);
  }

  generateSessionId() {
    return (
      't_' +
      Math.random().toString(36).substring(2, 11) +
      '_' +
      Date.now().toString(36)
    );
  }

  runEnvironmentChecks() {
    const nav = typeof navigator !== 'undefined' ? navigator : {};
    const win = typeof window !== 'undefined' ? window : {};

    // 1. Check for automated webdriver (Puppeteer, Selenium, Playwright)
    if (nav.webdriver) {
      this.botScore += 50;
      this.detectionFlags.webdriver = true;
    }

    // 2. Check for automation-specific global variables
    const automationGlobals = [
      '__webdriver_evaluate',
      '__selenium_evaluate',
      '__webdriver_script_function',
      '__webdriver_script_func',
      '__webdriver_script_fn',
      '__fxdriver_evaluate',
      '__driver_unwrapped',
      '__webdriver_unwrapped',
      '__selenium_unwrapped',
      '__fxdriver_unwrapped',
      '_phantom',
      'callPhantom',
      '__nightmare',
    ];
    for (const g of automationGlobals) {
      if (g in win) {
        this.botScore += 60;
        this.detectionFlags.automationGlobal = g;
        break;
      }
    }

    // 3. Screen and viewport anomaly checks
    const screen = win.screen || {};
    if (
      screen.width === 0 ||
      screen.height === 0 ||
      (win.outerWidth === 0 && win.outerHeight === 0)
    ) {
      this.botScore += 35;
      this.detectionFlags.zeroDimensionScreen = true;
    }

    // 4. Missing languages array
    if (!nav.languages || nav.languages.length === 0) {
      this.botScore += 25;
      this.detectionFlags.missingLanguages = true;
    }

    // 5. User-Agent regex check for known crawlers and headless environments
    const ua = (nav.userAgent || '').toLowerCase();
    const botPattern =
      /bot|crawler|spider|headlesschrome|phantomjs|slurp|seekport|ahrefs|semrush|python-requests|axios|curl|wget/i;
    if (botPattern.test(ua)) {
      this.botScore += 45;
      this.detectionFlags.botUserAgent = true;
    }
  }

  syncListeners() {
    if (typeof window === 'undefined') return;

    const isMasterActive = this.settings.enabled;

    // 1. Mouse movement dynamics (OFF by default for CPU performance)
    const shouldTrackMouseMove =
      isMasterActive && this.settings.trackMouseMoves;
    if (shouldTrackMouseMove && !this.listeners.mouseMove) {
      this.listeners.mouseMove = () => {
        this.interactionCounts.mouseMoves++;
        this.mouseMoveSampleCount++;
        if (this.mouseMoveSampleCount === 5) {
          // Human confirmed: reduce bot likelihood
          this.botScore = Math.max(0, this.botScore - 20);
          this.detachListener('mouseMove');
        }
      };
      window.addEventListener('mousemove', this.listeners.mouseMove, {
        passive: true,
      });
    } else if (!shouldTrackMouseMove && this.listeners.mouseMove) {
      this.detachListener('mouseMove');
    }

    // 2. Scroll dynamics and depth (OFF by default for 60fps scrolling)
    const shouldTrackScroll = isMasterActive && this.settings.trackScrollDepth;
    if (shouldTrackScroll && !this.listeners.scroll) {
      let ticking = false;
      this.listeners.scroll = () => {
        this.interactionCounts.scrolls++;
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const scrollTop =
              window.scrollY || document.documentElement.scrollTop || 0;
            const docHeight =
              document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight > 0) {
              const depthPercent = Math.min(
                100,
                Math.round((scrollTop / docHeight) * 100)
              );
              if (depthPercent > this.maxScrollDepth) {
                this.maxScrollDepth = depthPercent;
              }
            }
            ticking = false;
          });
          ticking = true;
        }
      };
      window.addEventListener('scroll', this.listeners.scroll, {
        passive: true,
      });
    } else if (!shouldTrackScroll && this.listeners.scroll) {
      this.detachListener('scroll');
    }

    // 3. Click coordinates for Heatmap HUD (OFF by default to eliminate DOM inspection overhead)
    const shouldTrackClick = isMasterActive && this.settings.trackClickCoords;
    if (shouldTrackClick && !this.listeners.click) {
      this.listeners.click = (e) => {
        this.interactionCounts.clicks++;
        if (typeof window !== 'undefined' && e) {
          const tag =
            e.target && e.target.tagName
              ? e.target.tagName.toLowerCase()
              : 'element';
          let text = '';

          if (this.settings.privacyMasking) {
            if (
              tag === 'input' ||
              tag === 'textarea' ||
              tag === 'select' ||
              e.target?.getAttribute('type') === 'password'
            ) {
              text = `[redacted_${tag}]`;
            } else {
              text =
                e.target && e.target.textContent
                  ? e.target.textContent.substring(0, 32).trim()
                  : '';
            }
          } else {
            text =
              e.target && e.target.textContent
                ? e.target.textContent.substring(0, 32).trim()
                : '';
          }

          const point = {
            x:
              typeof e.pageX === 'number' && e.pageX !== 0
                ? e.pageX
                : typeof e.clientX === 'number'
                  ? e.clientX
                  : e.pageX || 0,
            y:
              typeof e.pageY === 'number' && e.pageY !== 0
                ? e.pageY
                : typeof e.clientY === 'number'
                  ? e.clientY
                  : e.pageY || 0,
            timestamp: Date.now(),
            tag,
            text,
            path: window.location.pathname,
          };
          this.clickEvents.push(point);
          this.schedulePersistSessionData();
        }
      };
      window.addEventListener('click', this.listeners.click, { passive: true });
    } else if (!shouldTrackClick && this.listeners.click) {
      this.detachListener('click');
    }

    // 4. Touch event tracking
    const shouldTrackTouch =
      isMasterActive &&
      (this.settings.trackMouseMoves || this.settings.trackClickCoords);
    if (shouldTrackTouch && !this.listeners.touch) {
      this.listeners.touch = () => {
        this.interactionCounts.touches++;
        this.botScore = Math.max(0, this.botScore - 15);
      };
      window.addEventListener('touchstart', this.listeners.touch, {
        passive: true,
        once: true,
      });
    } else if (!shouldTrackTouch && this.listeners.touch) {
      this.detachListener('touch');
    }

    // 5. Keydown / Keyup cadence profiler (OFF by default)
    const shouldTrackTyping =
      isMasterActive && this.settings.trackTypingCadence;
    if (shouldTrackTyping && !this.listeners.keyDown) {
      this.listeners.keyDown = () => {
        this.interactionCounts.keystrokes++;
        this.lastKeydownTime = performance.now();
      };
      this.listeners.keyUp = () => {
        if (this.lastKeydownTime > 0) {
          const delta = Math.round(performance.now() - this.lastKeydownTime);
          this.typingDeltas.push(delta);
          if (
            delta === 0 &&
            this.typingDeltas.filter((d) => d === 0).length >= 3
          ) {
            this.botScore += 30;
            this.detectionFlags.instantTyping = true;
          }
        }
      };
      window.addEventListener('keydown', this.listeners.keyDown, {
        passive: true,
      });
      window.addEventListener('keyup', this.listeners.keyUp, { passive: true });
    } else if (!shouldTrackTyping && this.listeners.keyDown) {
      this.detachListener('keyDown');
      this.detachListener('keyUp');
    }
  }

  detachListener(name) {
    if (typeof window === 'undefined') return;
    if (name === 'mouseMove' && this.listeners.mouseMove) {
      window.removeEventListener('mousemove', this.listeners.mouseMove);
      this.listeners.mouseMove = null;
    } else if (name === 'scroll' && this.listeners.scroll) {
      window.removeEventListener('scroll', this.listeners.scroll);
      this.listeners.scroll = null;
    } else if (name === 'click' && this.listeners.click) {
      window.removeEventListener('click', this.listeners.click);
      this.listeners.click = null;
    } else if (name === 'touch' && this.listeners.touch) {
      window.removeEventListener('touchstart', this.listeners.touch);
      this.listeners.touch = null;
    } else if (name === 'keyDown' && this.listeners.keyDown) {
      window.removeEventListener('keydown', this.listeners.keyDown);
      this.listeners.keyDown = null;
    } else if (name === 'keyUp' && this.listeners.keyUp) {
      window.removeEventListener('keyup', this.listeners.keyUp);
      this.listeners.keyUp = null;
    }
  }

  detachAllListeners() {
    this.detachListener('mouseMove');
    this.detachListener('scroll');
    this.detachListener('click');
    this.detachListener('touch');
    this.detachListener('keyDown');
    this.detachListener('keyUp');
  }

  updateSettings(partial) {
    this.settings = { ...this.settings, ...partial };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'cart_telemetry_settings',
          JSON.stringify(this.settings)
        );
      } catch {
        // Storage errors ignored
      }
      this.syncListeners();
      window.dispatchEvent(
        new CustomEvent('cart_telemetry_settings_changed', {
          detail: { settings: this.settings },
        })
      );
    }
    return this.getSettings();
  }

  getSettings() {
    return { ...this.settings };
  }

  resetSettings() {
    return this.updateSettings(DEFAULT_TELEMETRY_SETTINGS);
  }

  applyPreset(presetKey) {
    const preset = TELEMETRY_PRESETS[presetKey];
    if (preset) {
      return this.updateSettings(preset.settings);
    }
    return this.getSettings();
  }

  getActiveListenerCount() {
    let count = 0;
    if (this.listeners.mouseMove) count++;
    if (this.listeners.scroll) count++;
    if (this.listeners.click) count++;
    if (this.listeners.keyDown) count++;
    return count;
  }

  getListenerStatus() {
    return {
      mouseMove: Boolean(this.listeners.mouseMove),
      scroll: Boolean(this.listeners.scroll),
      click: Boolean(this.listeners.click),
      typing: Boolean(this.listeners.keyDown),
      activeCount: this.getActiveListenerCount(),
      totalTrackers: 4,
    };
  }

  triggerHoneypot() {
    this.honeypotTriggered = true;
    this.botScore = 100;
    this.detectionFlags.honeypotTriggered = true;
    setTrafficClassification('suspected_bot');
  }

  getBotScore() {
    return Math.min(100, Math.max(0, this.botScore));
  }

  isBot() {
    return this.getBotScore() >= BOT_SCORE_THRESHOLD || this.honeypotTriggered;
  }

  getClassification() {
    return this.isBot() ? 'suspected_bot' : 'human';
  }

  getTelemetryData() {
    const dwellTimeMs = this.startTime ? Date.now() - this.startTime : 0;
    return {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      classification: this.getClassification(),
      botScore: this.getBotScore(),
      dwellTimeMs,
      maxScrollDepth: this.maxScrollDepth,
      interactions: { ...this.interactionCounts },
      flags: { ...this.detectionFlags },
      settings: { ...this.settings },
      screen:
        typeof window !== 'undefined'
          ? {
              width: window.innerWidth,
              height: window.innerHeight,
              devicePixelRatio: window.devicePixelRatio || 1,
            }
          : null,
      clickEvents: [...this.clickEvents],
    };
  }

  schedulePersistSessionData() {
    if (this.persistTimer) return;
    this.persistTimer = setTimeout(() => {
      this.persistSessionData();
      this.persistTimer = null;
    }, 1000);
  }

  persistSessionData() {
    if (typeof window === 'undefined') return;
    try {
      const storageKey = 'shopping_cart.admin_telemetry_sessions';
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const current = this.getTelemetryData();
      const filtered = existing.filter((s) => s.sessionId !== this.sessionId);
      filtered.unshift(current);
      localStorage.setItem(storageKey, JSON.stringify(filtered.slice(0, 25)));
    } catch {
      // Storage errors ignored
    }
  }

  getClickEvents() {
    return [...this.clickEvents];
  }

  getAllSessions() {
    if (typeof window === 'undefined') return [];
    try {
      const storageKey = 'shopping_cart.admin_telemetry_sessions';
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (saved.length === 0 && this.sessionId) {
        return [this.getTelemetryData()];
      }
      return saved;
    } catch {
      return [];
    }
  }

  clearSessions() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('shopping_cart.admin_telemetry_sessions');
      this.clickEvents = [];
    } catch {
      // Storage errors ignored
    }
  }

  flush(endpoint = process.env.NEXT_PUBLIC_TELEMETRY_ENDPOINT) {
    if (typeof window === 'undefined') return;
    if (this.persistTimer) {
      clearTimeout(this.persistTimer);
      this.persistTimer = null;
    }
    this.persistSessionData();

    const payload = this.getTelemetryData();

    if (endpoint && typeof navigator.sendBeacon === 'function') {
      try {
        const blob = new Blob([JSON.stringify(payload)], {
          type: 'application/json',
        });
        navigator.sendBeacon(endpoint, blob);
      } catch {
        // Beacon failure ignored gracefully
      }
    }

    return payload;
  }
}

export const telemetry = new TelemetryEngine();

/**
 * React Component for rendering an invisible Honeypot trap
 */
export function HoneypotField() {
  return (
    <div
      style={{
        position: 'absolute',
        left: '-9999px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        opacity: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
      tabIndex={-1}
    >
      <label htmlFor="website_url_hp">Leave this empty</label>
      <input
        type="text"
        id="website_url_hp"
        name="website_url_hp"
        tabIndex={-1}
        autoComplete="off"
        onChange={() => telemetry.triggerHoneypot()}
        onFocus={() => telemetry.triggerHoneypot()}
      />
    </div>
  );
}
