/**
 * Custom Client-Side Telemetry & Bot Detection Engine
 *
 * Collects privacy-respecting behavioral signals and browser environment heuristics
 * to distinguish genuine human shopper traffic from scrapers, crawlers, and headless bots.
 */

import { setTrafficClassification } from './google';

const BOT_SCORE_THRESHOLD = 50;

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
  }

  init({ autoClassifyGA = true } = {}) {
    if (typeof window === 'undefined' || this.isInitialized) return;
    this.isInitialized = true;
    this.startTime = Date.now();
    this.sessionId = this.generateSessionId();

    this.runEnvironmentChecks();
    this.attachBehavioralListeners();

    if (autoClassifyGA) {
      // Delay classification slightly to capture initial interaction signals
      setTimeout(() => {
        const classification = this.getClassification();
        setTrafficClassification(classification);
      }, 2500);
    }

    // Flush telemetry beacon on page unload / hide
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });
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

  attachBehavioralListeners() {
    if (typeof window === 'undefined') return;

    // Track mouse movement dynamics
    let mouseMoveSampleCount = 0;
    const onMouseMove = () => {
      this.interactionCounts.mouseMoves++;
      mouseMoveSampleCount++;
      if (mouseMoveSampleCount === 5) {
        // Human confirmed: reduce bot likelihood
        this.botScore = Math.max(0, this.botScore - 20);
        window.removeEventListener('mousemove', onMouseMove);
      }
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Track scroll dynamics and scroll depth
    const onScroll = () => {
      this.interactionCounts.scrolls++;
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
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Track click dynamics and coordinates for Admin Heatmap HUD
    const onClick = (e) => {
      this.interactionCounts.clicks++;
      if (typeof window !== 'undefined' && e) {
        const point = {
          x: typeof e.pageX === 'number' ? e.pageX : e.clientX || 0,
          y: typeof e.pageY === 'number' ? e.pageY : e.clientY || 0,
          timestamp: Date.now(),
          tag:
            e.target && e.target.tagName
              ? e.target.tagName.toLowerCase()
              : 'element',
          text:
            e.target && e.target.textContent
              ? e.target.textContent.substring(0, 32).trim()
              : '',
          path: window.location.pathname,
        };
        this.clickEvents.push(point);
        // Persist periodically or on activity
        this.persistSessionData();
      }
    };
    window.addEventListener('click', onClick, { passive: true });

    // Track touch events for mobile
    const onTouch = () => {
      this.interactionCounts.touches++;
      this.botScore = Math.max(0, this.botScore - 15);
    };
    window.addEventListener('touchstart', onTouch, {
      passive: true,
      once: true,
    });

    // Track human typing rhythm vs instantaneous script autofill
    window.addEventListener(
      'keydown',
      () => {
        this.interactionCounts.keystrokes++;
        this.lastKeydownTime = performance.now();
      },
      { passive: true }
    );

    window.addEventListener(
      'keyup',
      () => {
        if (this.lastKeydownTime > 0) {
          const delta = Math.round(performance.now() - this.lastKeydownTime);
          this.typingDeltas.push(delta);
          // Instant keyup (0ms delta) repeatedly indicates scripted input
          if (
            delta === 0 &&
            this.typingDeltas.filter((d) => d === 0).length >= 3
          ) {
            this.botScore += 30;
            this.detectionFlags.instantTyping = true;
          }
        }
      },
      { passive: true }
    );
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
