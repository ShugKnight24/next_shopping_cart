import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_TELEMETRY_SETTINGS,
  HoneypotField,
  TELEMETRY_PRESETS,
  telemetry,
} from '../analytics/telemetry';
import { AdminHeatmapHUD } from '../Components/Analytics/AdminHeatmapHUD';

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    query: { admin: 'true' },
    pathname: '/',
  }),
}));

describe('Telemetry & Bot Detection Engine', () => {
  beforeEach(() => {
    // Reset telemetry internal state and listeners for isolated testing
    telemetry.detachAllListeners();
    telemetry.botScore = 0;
    telemetry.honeypotTriggered = false;
    telemetry.detectionFlags = {};
    telemetry.interactionCounts = {
      clicks: 0,
      scrolls: 0,
      mouseMoves: 0,
      keystrokes: 0,
      touches: 0,
    };
    telemetry.maxScrollDepth = 0;
    telemetry.typingDeltas = [];
    telemetry.clickEvents = [];
    telemetry.mouseMoveSampleCount = 0;
    telemetry.settings = { ...DEFAULT_TELEMETRY_SETTINGS };
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
  });

  it('classifies standard human user as "human" with bot score below threshold', () => {
    expect(telemetry.getBotScore()).toBe(0);
    expect(telemetry.isBot()).toBe(false);
    expect(telemetry.getClassification()).toBe('human');
  });

  it('detects automation flags and increments bot score', () => {
    // Simulate navigator.webdriver
    Object.defineProperty(window.navigator, 'webdriver', {
      value: true,
      configurable: true,
    });

    telemetry.runEnvironmentChecks();

    expect(telemetry.detectionFlags.webdriver).toBe(true);
    expect(telemetry.getBotScore()).toBeGreaterThanOrEqual(50);
    expect(telemetry.isBot()).toBe(true);
    expect(telemetry.getClassification()).toBe('suspected_bot');

    // Clean up
    Object.defineProperty(window.navigator, 'webdriver', {
      value: false,
      configurable: true,
    });
  });

  it('triggers honeypot detection with 100% bot confidence', () => {
    telemetry.triggerHoneypot();

    expect(telemetry.honeypotTriggered).toBe(true);
    expect(telemetry.getBotScore()).toBe(100);
    expect(telemetry.isBot()).toBe(true);
    expect(telemetry.getClassification()).toBe('suspected_bot');
  });

  it('renders HoneypotField as an invisible trap and triggers on interaction', () => {
    const { container } = render(<HoneypotField />);
    const input = container.querySelector('input[name="website_url_hp"]');

    expect(input).toBeDefined();
    expect(container.firstChild.getAttribute('aria-hidden')).toBe('true');

    // Human would never focus or change this, but a crawler bot will
    fireEvent.change(input, { target: { value: 'http://spam-link.com' } });

    expect(telemetry.honeypotTriggered).toBe(true);
    expect(telemetry.isBot()).toBe(true);
  });

  it('generates a complete telemetry payload on flush with active settings', () => {
    telemetry.init({ autoClassifyGA: false });
    const payload = telemetry.getTelemetryData();

    expect(payload).toHaveProperty('sessionId');
    expect(payload).toHaveProperty('timestamp');
    expect(payload).toHaveProperty('classification');
    expect(payload).toHaveProperty('botScore');
    expect(payload).toHaveProperty('dwellTimeMs');
    expect(payload).toHaveProperty('interactions');
    expect(payload).toHaveProperty('flags');
    expect(payload).toHaveProperty('settings');
    expect(payload.settings.trackMouseMoves).toBe(false);
  });

  describe('Performance Defaults & Dynamic Telemetry Settings', () => {
    it('has all continuous advanced tracking tactics turned OFF by default', () => {
      const settings = telemetry.getSettings();

      expect(settings.enabled).toBe(true);
      expect(settings.trackMouseMoves).toBe(false);
      expect(settings.trackScrollDepth).toBe(false);
      expect(settings.trackClickCoords).toBe(false);
      expect(settings.trackTypingCadence).toBe(false);
      expect(settings.botDetection).toBe(true);
      expect(settings.privacyMasking).toBe(true);

      telemetry.init({ autoClassifyGA: false });
      expect(telemetry.getActiveListenerCount()).toBe(0);
      expect(telemetry.getListenerStatus().activeCount).toBe(0);
    });

    it('does not record mouse moves or click coordinates when advanced tactics are off', () => {
      telemetry.init({ autoClassifyGA: false });

      // Simulate mouse move and click
      fireEvent.mouseMove(window, { clientX: 100, clientY: 200 });
      fireEvent.click(document.body, { clientX: 100, clientY: 200 });

      expect(telemetry.interactionCounts.mouseMoves).toBe(0);
      expect(telemetry.interactionCounts.clicks).toBe(0);
      expect(telemetry.getClickEvents()).toHaveLength(0);
    });

    it('dynamically attaches click listener and records coordinates when enabled', () => {
      telemetry.init({ autoClassifyGA: false });

      // Enable click tracking
      telemetry.updateSettings({ trackClickCoords: true });
      expect(telemetry.getListenerStatus().click).toBe(true);

      // Create a dummy button and click it
      const button = document.createElement('button');
      button.textContent = 'Add to Bag';
      document.body.appendChild(button);

      fireEvent.click(button, {
        pageX: 250,
        pageY: 350,
        clientX: 250,
        clientY: 350,
      });

      const clicks = telemetry.getClickEvents();
      expect(clicks).toHaveLength(1);
      expect(clicks[0].x).toBe(250);
      expect(clicks[0].y).toBe(350);
      expect(clicks[0].tag).toBe('button');
      expect(clicks[0].text).toBe('Add to Bag');

      button.remove();

      // Disable click tracking again
      telemetry.updateSettings({ trackClickCoords: false });
      expect(telemetry.getListenerStatus().click).toBe(false);
    });

    it('enforces privacy masking on sensitive input and textarea elements', () => {
      telemetry.init({ autoClassifyGA: false });
      telemetry.updateSettings({
        trackClickCoords: true,
        privacyMasking: true,
      });

      const input = document.createElement('input');
      input.type = 'text';
      input.value = 'confidential shopper note';
      document.body.appendChild(input);

      fireEvent.click(input, { pageX: 120, pageY: 180 });

      const clicks = telemetry.getClickEvents();
      expect(clicks).toHaveLength(1);
      expect(clicks[0].text).toBe('[redacted_input]');

      input.remove();
    });

    it('applies quick presets correctly (diagnostic, performance, heatmapOnly)', () => {
      telemetry.init({ autoClassifyGA: false });

      // Full Diagnostic preset
      telemetry.applyPreset('diagnostic');
      expect(telemetry.getListenerStatus().activeCount).toBe(4);
      expect(telemetry.getSettings().trackMouseMoves).toBe(true);
      expect(telemetry.getSettings().trackScrollDepth).toBe(true);
      expect(telemetry.getSettings().trackClickCoords).toBe(true);
      expect(telemetry.getSettings().trackTypingCadence).toBe(true);

      // Heatmap Only preset
      telemetry.applyPreset('heatmapOnly');
      expect(telemetry.getListenerStatus().activeCount).toBe(1);
      expect(telemetry.getSettings().trackClickCoords).toBe(true);
      expect(telemetry.getSettings().trackMouseMoves).toBe(false);

      // Performance Safe preset (restores all advanced to off)
      telemetry.applyPreset('performance');
      expect(telemetry.getListenerStatus().activeCount).toBe(0);
      expect(telemetry.getSettings()).toEqual(
        TELEMETRY_PRESETS.performance.settings
      );
    });

    it('suspends all active listeners when master enabled toggle is turned off', () => {
      telemetry.init({ autoClassifyGA: false });
      telemetry.applyPreset('diagnostic');
      expect(telemetry.getActiveListenerCount()).toBe(4);

      telemetry.updateSettings({ enabled: false });
      expect(telemetry.getActiveListenerCount()).toBe(0);

      telemetry.updateSettings({ enabled: true });
      expect(telemetry.getActiveListenerCount()).toBe(4);
    });
  });

  describe('AdminHeatmapHUD Settings Interface', () => {
    it('renders tabs and allows switching to Telemetry Settings panel', () => {
      render(<AdminHeatmapHUD />);

      // Verify Admin HUD header and tabs render
      expect(screen.getByText('Admin Heatmap HUD')).toBeDefined();
      const settingsTab = screen.getByRole('tab', {
        name: 'Telemetry Settings',
      });
      expect(settingsTab).toBeDefined();

      // Switch to Telemetry Settings tab
      fireEvent.click(settingsTab);

      // Verify Performance notice, presets, and toggles are visible
      expect(screen.getByText('Performance First Architecture')).toBeDefined();
      expect(screen.getByText('Performance Safe')).toBeDefined();
      expect(screen.getByText('Full Diagnostic')).toBeDefined();
      expect(screen.getByText('Heatmap Only')).toBeDefined();
      expect(screen.getByText('Pointer Movement Dynamics')).toBeDefined();
      expect(screen.getByText('Click Coordinate Capture')).toBeDefined();
    });

    it('toggles a telemetry setting via the HUD interface', () => {
      render(<AdminHeatmapHUD />);

      // Switch to Telemetry Settings tab
      fireEvent.click(screen.getByRole('tab', { name: 'Telemetry Settings' }));

      // Find click coordinate capture toggle
      const clickToggle = screen.getByLabelText(
        'Toggle click coordinate capture'
      );
      expect(clickToggle.checked).toBe(false);

      // Click to toggle ON
      fireEvent.click(clickToggle);
      expect(telemetry.getSettings().trackClickCoords).toBe(true);

      // Click to toggle OFF
      fireEvent.click(clickToggle);
      expect(telemetry.getSettings().trackClickCoords).toBe(false);
    });
  });
});
