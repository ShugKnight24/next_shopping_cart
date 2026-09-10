import { fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { HoneypotField, telemetry } from '../analytics/telemetry';

describe('Telemetry & Bot Detection Engine', () => {
  beforeEach(() => {
    // Reset telemetry internal state for isolated testing
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

  it('generates a complete telemetry payload on flush', () => {
    telemetry.init({ autoClassifyGA: false });
    const payload = telemetry.getTelemetryData();

    expect(payload).toHaveProperty('sessionId');
    expect(payload).toHaveProperty('timestamp');
    expect(payload).toHaveProperty('classification');
    expect(payload).toHaveProperty('botScore');
    expect(payload).toHaveProperty('dwellTimeMs');
    expect(payload).toHaveProperty('interactions');
    expect(payload).toHaveProperty('flags');
  });
});
