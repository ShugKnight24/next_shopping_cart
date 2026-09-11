import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { TELEMETRY_PRESETS, telemetry } from '../../analytics/telemetry';
import styles from './AdminHeatmapHUD.module.css';

const SAMPLE_SESSIONS = [
  {
    sessionId: 'session_noah_shopper',
    label: 'Noah (macOS • Chrome) — Storybook Builder',
    classification: 'human',
    botScore: 4,
    dwellTimeMs: 145000,
    maxScrollDepth: 88,
    interactions: {
      clicks: 14,
      scrolls: 42,
      mouseMoves: 180,
      keystrokes: 35,
      touches: 0,
    },
    screen: { width: 1440, height: 900 },
    clickEvents: [
      { x: 380, y: 320, tag: 'button', text: "Children's Storybooks" },
      { x: 520, y: 440, tag: 'input', text: 'Noah' },
      { x: 610, y: 560, tag: 'button', text: 'Continue to Next Step' },
      { x: 420, y: 650, tag: 'button', text: 'Sneakerhead Odyssey' },
      { x: 700, y: 780, tag: 'button', text: 'Continue to Next Step' },
      {
        x: 480,
        y: 880,
        tag: 'textarea',
        text: 'Special Front Page Dedication',
      },
      { x: 820, y: 620, tag: 'canvas', text: 'Storybook Canvas Proof' },
      { x: 860, y: 640, tag: 'button', text: 'Select Luna Cosmic Companion' },
      { x: 910, y: 660, tag: 'canvas', text: 'Placed Stamp' },
      { x: 620, y: 1100, tag: 'button', text: 'Add to Bag' },
    ],
  },
  {
    sessionId: 'session_maya_mobile',
    label: 'Maya (iOS • Mobile Safari) — Apparel Customizer',
    classification: 'human',
    botScore: 0,
    dwellTimeMs: 98000,
    maxScrollDepth: 95,
    interactions: {
      clicks: 9,
      scrolls: 65,
      mouseMoves: 0,
      keystrokes: 12,
      touches: 78,
    },
    screen: { width: 390, height: 844 },
    clickEvents: [
      { x: 195, y: 360, tag: 'button', text: "Kids' Apparel & Kicks" },
      { x: 180, y: 520, tag: 'button', text: 'Varsity Bomber Jacket' },
      { x: 140, y: 610, tag: 'button', text: 'Youth M' },
      { x: 210, y: 720, tag: 'input', text: 'Monogram: LEO' },
      { x: 195, y: 860, tag: 'button', text: 'Add Custom Apparel to Bag' },
    ],
  },
  {
    sessionId: 'session_bot_crawler',
    label: 'Automated Bot (Headless Chrome) — Scraper',
    classification: 'suspected_bot',
    botScore: 95,
    dwellTimeMs: 3200,
    maxScrollDepth: 12,
    interactions: {
      clicks: 1,
      scrolls: 0,
      mouseMoves: 0,
      keystrokes: 0,
      touches: 0,
    },
    screen: { width: 800, height: 600 },
    clickEvents: [{ x: 10, y: 10, tag: 'input', text: 'Honeypot Trap Input' }],
  },
];

export function AdminHeatmapHUD() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('visuals'); // 'visuals' | 'settings'
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('all');
  const [userFilter, setUserFilter] = useState('all'); // 'all' | 'human' | 'bot'
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showPins, setShowPins] = useState(true);
  const [showScrollFolds, setShowScrollFolds] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [docHeight, setDocHeight] = useState(1200);

  // Live telemetry settings and listener diagnostics
  const [telemetrySettings, setTelemetrySettings] = useState(() =>
    telemetry.getSettings()
  );
  const [listenerStatus, setListenerStatus] = useState(() =>
    telemetry.getListenerStatus()
  );

  // Check admin authorization via query (?admin=true), localStorage, or keyboard shortcut
  useEffect(() => {
    if (router.query.admin === 'true' || router.query.admin === '1') {
      setIsAdmin(true);
      try {
        localStorage.setItem('cart_admin_mode', 'true');
      } catch {
        // ignore
      }
    } else {
      try {
        if (localStorage.getItem('cart_admin_mode') === 'true') {
          setIsAdmin(true);
        }
      } catch {
        // ignore
      }
    }

    const handleKeyDown = (e) => {
      // Hotkey: Ctrl+Shift+H or Cmd+Shift+H
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === 'h'
      ) {
        e.preventDefault();
        setIsAdmin((prev) => {
          const next = !prev;
          try {
            localStorage.setItem('cart_admin_mode', next ? 'true' : 'false');
          } catch {
            // ignore
          }
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router.query.admin]);

  // Sync settings updates dispatched from TelemetryEngine
  useEffect(() => {
    const handleSettingsChange = (e) => {
      if (e.detail?.settings) {
        setTelemetrySettings(e.detail.settings);
      }
      setListenerStatus(telemetry.getListenerStatus());
    };

    window.addEventListener(
      'cart_telemetry_settings_changed',
      handleSettingsChange
    );
    return () =>
      window.removeEventListener(
        'cart_telemetry_settings_changed',
        handleSettingsChange
      );
  }, []);

  // Load recorded sessions from telemetry engine + sample sessions
  useEffect(() => {
    if (!isAdmin) return;

    const updateSessions = () => {
      const liveSessions = telemetry.getAllSessions();
      // Merge live recorded sessions with simulated reference sessions
      const existingIds = new Set(liveSessions.map((s) => s.sessionId));
      const combined = [
        ...liveSessions,
        ...SAMPLE_SESSIONS.filter((s) => !existingIds.has(s.sessionId)),
      ];
      setSessions(combined);

      if (typeof document !== 'undefined') {
        setDocHeight(
          document.documentElement.scrollHeight || window.innerHeight
        );
      }
    };

    updateSessions();
    const interval = setInterval(updateSessions, 3000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // Filter sessions based on classification filter
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (userFilter === 'human') return s.classification === 'human';
      if (userFilter === 'bot') return s.classification === 'suspected_bot';
      return true;
    });
  }, [sessions, userFilter]);

  // Compute active click points based on selected session
  const activeClickPoints = useMemo(() => {
    if (selectedSessionId === 'all') {
      return filteredSessions.flatMap((s) =>
        (s.clickEvents || []).map((pt) => ({
          ...pt,
          userClassification: s.classification,
          userName: s.label || s.sessionId,
        }))
      );
    }
    const found = sessions.find((s) => s.sessionId === selectedSessionId);
    if (!found) return [];
    return (found.clickEvents || []).map((pt) => ({
      ...pt,
      userClassification: found.classification,
      userName: found.label || found.sessionId,
    }));
  }, [selectedSessionId, filteredSessions, sessions]);

  // Summary metrics for the HUD display
  const metrics = useMemo(() => {
    const totalClicks = activeClickPoints.length;
    const humanCount = filteredSessions.filter(
      (s) => s.classification === 'human'
    ).length;
    const botCount = filteredSessions.filter(
      (s) => s.classification === 'suspected_bot'
    ).length;
    const avgBotScore =
      filteredSessions.length > 0
        ? Math.round(
            filteredSessions.reduce((acc, s) => acc + (s.botScore || 0), 0) /
              filteredSessions.length
          )
        : 0;

    return {
      totalClicks,
      sessionCount: filteredSessions.length,
      humanRatio:
        filteredSessions.length > 0
          ? Math.round((humanCount / filteredSessions.length) * 100)
          : 100,
      avgBotScore,
      botCount,
    };
  }, [activeClickPoints, filteredSessions]);

  const handleExportTelemetry = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `telemetry_heatmap_export_${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearSessions = () => {
    telemetry.clearSessions();
    setSessions(SAMPLE_SESSIONS);
  };

  const handleToggleSetting = (key) => {
    const updated = telemetry.updateSettings({
      [key]: !telemetrySettings[key],
    });
    setTelemetrySettings(updated);
    setListenerStatus(telemetry.getListenerStatus());
  };

  const handleApplyPreset = (presetKey) => {
    const updated = telemetry.applyPreset(presetKey);
    setTelemetrySettings(updated);
    setListenerStatus(telemetry.getListenerStatus());
  };

  const handleResetSettings = () => {
    const updated = telemetry.resetSettings();
    setTelemetrySettings(updated);
    setListenerStatus(telemetry.getListenerStatus());
  };

  if (!isAdmin) {
    return (
      <button
        type="button"
        className={styles.adminTriggerBadge}
        onClick={() => setIsAdmin(true)}
        title="Open Admin Heatmap HUD (Ctrl+Shift+H)"
        aria-label="Open Admin Heatmap HUD"
      >
        <span className={styles.triggerPulse} />
        <span>Admin HUD</span>
      </button>
    );
  }

  return (
    <div className={styles.hudRoot}>
      {/* FULL-PAGE HEATMAP & CLICK VISUALIZER OVERLAY */}
      <div
        className={styles.heatmapCanvasOverlay}
        style={{ height: `${docHeight}px` }}
        aria-hidden="true"
      >
        {/* Render glowing heat spots */}
        {showHeatmap &&
          activeClickPoints.map((pt, idx) => {
            const isBot = pt.userClassification === 'suspected_bot';
            const bgGradient = isBot
              ? 'radial-gradient(circle, rgba(239, 68, 68, 0.7) 0%, rgba(220, 38, 38, 0.3) 50%, transparent 80%)'
              : 'radial-gradient(circle, rgba(56, 189, 248, 0.8) 0%, rgba(251, 191, 36, 0.5) 45%, rgba(239, 68, 68, 0.25) 70%, transparent 90%)';

            return (
              <div
                key={`heat-${idx}`}
                className={styles.heatSpot}
                style={{
                  left: `${pt.x}px`,
                  top: `${pt.y}px`,
                  width: '64px',
                  height: '64px',
                  background: bgGradient,
                }}
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

        {/* Render precise click pins with inspection tooltip */}
        {showPins &&
          activeClickPoints.map((pt, idx) => (
            <div
              key={`pin-${idx}`}
              className={styles.clickPin}
              style={{ left: `${pt.x}px`, top: `${pt.y}px` }}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <div className={styles.pinDot} />
              {hoveredPoint === pt && (
                <div className={styles.pinTooltip}>
                  <strong>{pt.userName}</strong>
                  <div>
                    Clicked: &lt;{pt.tag}&gt; &quot;{pt.text || 'Element'}&quot;
                  </div>
                  <div>
                    Coords: ({Math.round(pt.x)}, {Math.round(pt.y)})
                  </div>
                </div>
              )}
            </div>
          ))}

        {/* Render Scroll Fold Reference Lines */}
        {showScrollFolds && (
          <>
            <div
              className={styles.scrollFoldLine}
              style={{ top: `${docHeight * 0.25}px` }}
            >
              <span className={styles.scrollFoldTag}>
                25% Fold (92% Viewers)
              </span>
            </div>
            <div
              className={styles.scrollFoldLine}
              style={{ top: `${docHeight * 0.5}px` }}
            >
              <span className={styles.scrollFoldTag}>
                50% Fold (78% Viewers)
              </span>
            </div>
            <div
              className={styles.scrollFoldLine}
              style={{ top: `${docHeight * 0.75}px` }}
            >
              <span className={styles.scrollFoldTag}>
                75% Fold (54% Viewers)
              </span>
            </div>
          </>
        )}
      </div>

      {/* FLOATING ADMIN HUD CONTROL WINDOW */}
      <aside
        className={`${styles.hudPanel} ${isMinimized ? styles.hudPanelMinimized : ''}`}
        role="region"
        aria-label="Admin Interaction Heatmap HUD"
      >
        <header className={styles.hudHeader}>
          <div className={styles.hudTitleArea}>
            <span className={styles.triggerPulse} />
            <strong>Admin Heatmap HUD</strong>
          </div>
          <div className={styles.hudHeaderButtons}>
            <button
              type="button"
              className={styles.hudIconButton}
              onClick={() => setIsMinimized((prev) => !prev)}
              title={isMinimized ? 'Expand HUD' : 'Minimize HUD'}
              aria-label={isMinimized ? 'Expand HUD' : 'Minimize HUD'}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                {isMinimized ? (
                  <path d="M4 14h16M4 10h16" />
                ) : (
                  <path d="M5 12h14" />
                )}
              </svg>
            </button>
            <button
              type="button"
              className={styles.hudIconButton}
              onClick={() => setIsAdmin(false)}
              title="Close Admin HUD"
              aria-label="Close Admin HUD"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        {!isMinimized && (
          <div className={styles.hudBody}>
            {/* HUD View Switcher Tabs */}
            <div className={styles.hudTabs} role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'visuals'}
                className={`${styles.hudTabButton} ${activeTab === 'visuals' ? styles.hudTabActive : ''}`}
                onClick={() => setActiveTab('visuals')}
              >
                Visuals & Heatmap
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'settings'}
                className={`${styles.hudTabButton} ${activeTab === 'settings' ? styles.hudTabActive : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                Telemetry Settings
              </button>
            </div>

            {activeTab === 'visuals' ? (
              <>
                {/* User Session Switcher */}
                <div className={styles.sessionSection}>
                  <span className={styles.sectionLabel}>
                    Audience / User Session:
                  </span>
                  <select
                    className={styles.sessionSelect}
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    aria-label="Select user session for heatmap"
                  >
                    <option value="all">
                      🔥 All Users (Aggregated Heatmap • {sessions.length}{' '}
                      sessions)
                    </option>
                    {filteredSessions.map((s) => (
                      <option key={s.sessionId} value={s.sessionId}>
                        {s.classification === 'suspected_bot' ? '🤖' : '👤'}{' '}
                        {s.label || `User ${s.sessionId.substring(0, 10)}`} (
                        {s.clickEvents?.length || 0} clicks)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Metrics Dashboard */}
                <div className={styles.metricsGrid}>
                  <div className={styles.metricCard}>
                    <span className={styles.metricVal}>
                      {metrics.totalClicks}
                    </span>
                    <span className={styles.metricTag}>Clicks Plotted</span>
                  </div>
                  <div className={styles.metricCard}>
                    <span className={styles.metricVal}>
                      {metrics.humanRatio}%
                    </span>
                    <span className={styles.metricTag}>Human Traffic</span>
                  </div>
                  <div className={styles.metricCard}>
                    <span className={styles.metricVal}>
                      {metrics.avgBotScore}
                    </span>
                    <span className={styles.metricTag}>Avg Bot Risk</span>
                  </div>
                </div>

                {/* Layer Visibility Toggles */}
                <div className={styles.toggleGroup}>
                  <div className={styles.toggleRow}>
                    <span>Click Density Glow</span>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={showHeatmap}
                        onChange={(e) => setShowHeatmap(e.target.checked)}
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>

                  <div className={styles.toggleRow}>
                    <span>Interaction Pins & Inspect</span>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={showPins}
                        onChange={(e) => setShowPins(e.target.checked)}
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>

                  <div className={styles.toggleRow}>
                    <span>Scroll Depth Fold Lines</span>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={showScrollFolds}
                        onChange={(e) => setShowScrollFolds(e.target.checked)}
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>
                </div>

                {/* User Classification Filter */}
                <div className={styles.sessionSection}>
                  <span className={styles.sectionLabel}>
                    Filter By Classification:
                  </span>
                  <select
                    className={styles.sessionSelect}
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    aria-label="Filter sessions by traffic classification"
                  >
                    <option value="all">All Shoppers & Visitors</option>
                    <option value="human">Verified Genuine Humans Only</option>
                    <option value="bot">Suspected Crawlers & Bots Only</option>
                  </select>
                </div>

                {/* Actions */}
                <div className={styles.actionRow}>
                  <button
                    type="button"
                    className={styles.hudActionBtn}
                    onClick={handleExportTelemetry}
                    title="Export sessions as JSON"
                  >
                    Export JSON
                  </button>
                  <button
                    type="button"
                    className={`${styles.hudActionBtn} ${styles.hudClearBtn}`}
                    onClick={handleClearSessions}
                    title="Reset local telemetry data"
                  >
                    Reset Data
                  </button>
                </div>
              </>
            ) : (
              /* TELEMETRY SETTINGS & PERFORMANCE CONTROLS */
              <div className={styles.settingsSection}>
                {/* Master Collector Toggle */}
                <div className={styles.masterToggleCard}>
                  <div className={styles.masterInfo}>
                    <div className={styles.masterTitleRow}>
                      <strong>Master Collector</strong>
                      <span
                        className={`${styles.statusPill} ${telemetrySettings.enabled ? styles.statusPillSuccess : styles.statusPillMuted}`}
                      >
                        {telemetrySettings.enabled ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <span className={styles.settingDescription}>
                      Global client telemetry engine state
                    </span>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={telemetrySettings.enabled}
                      onChange={() => handleToggleSetting('enabled')}
                      aria-label="Toggle master telemetry engine"
                    />
                    <span className={styles.slider} />
                  </label>
                </div>

                {/* Performance Callout */}
                <div className={styles.perfNotice}>
                  <div className={styles.perfNoticeHeader}>
                    <span className={styles.perfIcon}>⚡</span>
                    <strong>Performance First Architecture</strong>
                  </div>
                  <p>
                    Advanced behavioral tracking is turned{' '}
                    <strong>OFF by default</strong> to keep the storefront
                    ultra-responsive. Enable tactics below as needed for
                    diagnostic sampling.
                  </p>
                </div>

                {/* Listener Diagnostics Status */}
                <div className={styles.diagnosticsPill}>
                  <div className={styles.diagnosticsLeft}>
                    <span className={styles.diagnosticsDot} />
                    <span>
                      {listenerStatus.activeCount} of{' '}
                      {listenerStatus.totalTrackers} Advanced Trackers Active
                    </span>
                  </div>
                  <span className={styles.diagnosticsTag}>
                    {listenerStatus.activeCount === 0
                      ? 'Performance Optimized'
                      : 'Active Sampling'}
                  </span>
                </div>

                {/* Quick Presets */}
                <div className={styles.presetSection}>
                  <span className={styles.sectionLabel}>Quick Presets:</span>
                  <div className={styles.presetGroup}>
                    <button
                      type="button"
                      className={`${styles.presetBtn} ${
                        !telemetrySettings.trackMouseMoves &&
                        !telemetrySettings.trackScrollDepth &&
                        !telemetrySettings.trackClickCoords &&
                        !telemetrySettings.trackTypingCadence
                          ? styles.presetBtnActive
                          : ''
                      }`}
                      onClick={() => handleApplyPreset('performance')}
                      title={TELEMETRY_PRESETS.performance.description}
                    >
                      Performance Safe
                    </button>
                    <button
                      type="button"
                      className={`${styles.presetBtn} ${
                        telemetrySettings.trackMouseMoves &&
                        telemetrySettings.trackScrollDepth &&
                        telemetrySettings.trackClickCoords &&
                        telemetrySettings.trackTypingCadence
                          ? styles.presetBtnActive
                          : ''
                      }`}
                      onClick={() => handleApplyPreset('diagnostic')}
                      title={TELEMETRY_PRESETS.diagnostic.description}
                    >
                      Full Diagnostic
                    </button>
                    <button
                      type="button"
                      className={`${styles.presetBtn} ${
                        telemetrySettings.trackClickCoords &&
                        !telemetrySettings.trackMouseMoves &&
                        !telemetrySettings.trackScrollDepth
                          ? styles.presetBtnActive
                          : ''
                      }`}
                      onClick={() => handleApplyPreset('heatmapOnly')}
                      title={TELEMETRY_PRESETS.heatmapOnly.description}
                    >
                      Heatmap Only
                    </button>
                  </div>
                </div>

                {/* Granular Tracking Option Toggles */}
                <div className={styles.settingCardList}>
                  {/* Mouse Move Tracking */}
                  <div className={styles.settingItem}>
                    <div className={styles.settingText}>
                      <div className={styles.settingHeaderRow}>
                        <span>Pointer Movement Dynamics</span>
                        <span
                          className={`${styles.tacticBadge} ${styles.badgeHighCpu}`}
                        >
                          High CPU
                        </span>
                      </div>
                      <span className={styles.settingDescription}>
                        Track cursor coordinates & velocity to verify motor
                        dynamics (off by default).
                      </span>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={telemetrySettings.trackMouseMoves}
                        onChange={() => handleToggleSetting('trackMouseMoves')}
                        disabled={!telemetrySettings.enabled}
                        aria-label="Toggle pointer movement dynamics"
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>

                  {/* Scroll Depth Tracking */}
                  <div className={styles.settingItem}>
                    <div className={styles.settingText}>
                      <div className={styles.settingHeaderRow}>
                        <span>Scroll Depth & Velocity</span>
                        <span
                          className={`${styles.tacticBadge} ${styles.badgeScroll}`}
                        >
                          Scroll IO
                        </span>
                      </div>
                      <span className={styles.settingDescription}>
                        Monitor document scroll boundaries & fold benchmarks
                        (off by default).
                      </span>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={telemetrySettings.trackScrollDepth}
                        onChange={() => handleToggleSetting('trackScrollDepth')}
                        disabled={!telemetrySettings.enabled}
                        aria-label="Toggle scroll depth tracking"
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>

                  {/* Click Coordinate Heatmap */}
                  <div className={styles.settingItem}>
                    <div className={styles.settingText}>
                      <div className={styles.settingHeaderRow}>
                        <span>Click Coordinate Capture</span>
                        <span
                          className={`${styles.tacticBadge} ${styles.badgeDom}`}
                        >
                          DOM Traversal
                        </span>
                      </div>
                      <span className={styles.settingDescription}>
                        Record exact (X, Y) click positions and element tags for
                        heatmap (off by default).
                      </span>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={telemetrySettings.trackClickCoords}
                        onChange={() => handleToggleSetting('trackClickCoords')}
                        disabled={!telemetrySettings.enabled}
                        aria-label="Toggle click coordinate capture"
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>

                  {/* Typing Cadence Profiler */}
                  <div className={styles.settingItem}>
                    <div className={styles.settingText}>
                      <div className={styles.settingHeaderRow}>
                        <span>Typing Cadence Profiler</span>
                        <span
                          className={`${styles.tacticBadge} ${styles.badgeEvent}`}
                        >
                          Event Listener
                        </span>
                      </div>
                      <span className={styles.settingDescription}>
                        Measure keydown-to-keyup rhythm to identify scripted
                        autofill bots (off by default).
                      </span>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={telemetrySettings.trackTypingCadence}
                        onChange={() =>
                          handleToggleSetting('trackTypingCadence')
                        }
                        disabled={!telemetrySettings.enabled}
                        aria-label="Toggle typing cadence profiler"
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>

                  {/* Static Environment Heuristics */}
                  <div className={styles.settingItem}>
                    <div className={styles.settingText}>
                      <div className={styles.settingHeaderRow}>
                        <span>Environment & Bot Heuristics</span>
                        <span
                          className={`${styles.tacticBadge} ${styles.badgeSafe}`}
                        >
                          Lightweight
                        </span>
                      </div>
                      <span className={styles.settingDescription}>
                        Inspect navigator.webdriver, automation globals, and
                        screen size (on by default).
                      </span>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={telemetrySettings.botDetection}
                        onChange={() => handleToggleSetting('botDetection')}
                        disabled={!telemetrySettings.enabled}
                        aria-label="Toggle bot environment heuristics"
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>

                  {/* Privacy Masking */}
                  <div className={styles.settingItem}>
                    <div className={styles.settingText}>
                      <div className={styles.settingHeaderRow}>
                        <span>Privacy Masking & Redaction</span>
                        <span
                          className={`${styles.tacticBadge} ${styles.badgeSafe}`}
                        >
                          Privacy Safe
                        </span>
                      </div>
                      <span className={styles.settingDescription}>
                        Sanitize input fields, textareas, and sensitive shopper
                        data (on by default).
                      </span>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={telemetrySettings.privacyMasking}
                        onChange={() => handleToggleSetting('privacyMasking')}
                        disabled={!telemetrySettings.enabled}
                        aria-label="Toggle privacy masking"
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>
                </div>

                {/* Settings Reset Button */}
                <div className={styles.actionRow}>
                  <button
                    type="button"
                    className={`${styles.hudActionBtn} ${styles.hudClearBtn}`}
                    onClick={handleResetSettings}
                    title="Restore default performance-safe settings"
                  >
                    Restore Performance Defaults
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
