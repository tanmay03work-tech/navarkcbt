/**
 * Browser & Hardware Fingerprint Generator
 * Used for CBT single-device lockdown and anti-cheat binding.
 */

export function getDeviceFingerprint(): string {
  try {
    const nav = window.navigator;
    const screen = window.screen;

    // Collect hardware and environment parameters
    const components: string[] = [
      nav.userAgent || '',
      nav.language || '',
      (nav as any).hardwareConcurrency?.toString() || '4',
      (nav as any).deviceMemory?.toString() || '8',
      screen.width?.toString() || '1920',
      screen.height?.toString() || '1080',
      screen.colorDepth?.toString() || '24',
      Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    ];

    // Canvas fingerprinting
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('NavarkCBT:Secured', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('NavarkCBT:Secured', 4, 17);
        components.push(canvas.toDataURL());
      }
    } catch {
      // Fallback if canvas is restricted
    }

    // DJB2 hash algorithm
    const raw = components.join('###');
    let hash = 5381;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash * 33) ^ raw.charCodeAt(i);
    }
    const hex = (hash >>> 0).toString(16).padStart(8, '0');
    return `FP-${hex.toUpperCase()}`;
  } catch {
    return `FP-DEFAULT-${Date.now()}`;
  }
}

