import { Injectable } from '@angular/core';

export type ThemeSurfaceStyle = 'glass' | 'solid';
export type ThemeDensity = 'comfortable' | 'compact';
export type ThemeGraphStyle = 'soft' | 'vivid';

export interface ThemePreferences {
  primaryColor: string;
  accentColor: string;
  surfaceStyle: ThemeSurfaceStyle;
  density: ThemeDensity;
  reducedMotion: boolean;
  highContrast: boolean;
  graphStyle: ThemeGraphStyle;
}

@Injectable({
  providedIn: 'root',
})
export class ThemePreferencesService {
  private readonly storageKey = 'humant.workspace.theme.preferences';

  getDefaults(): ThemePreferences {
    return {
      primaryColor: '#1c4e80',
      accentColor: '#1d7874',
      surfaceStyle: 'glass',
      density: 'comfortable',
      reducedMotion: false,
      highContrast: false,
      graphStyle: 'soft',
    };
  }

  read(): ThemePreferences {
    const fallback = this.getDefaults();
    const rawValue = localStorage.getItem(this.storageKey);

    if (!rawValue) {
      return fallback;
    }

    try {
      const parsed = JSON.parse(rawValue) as Partial<ThemePreferences>;
      return {
        primaryColor: this.normalizeColor(parsed.primaryColor, fallback.primaryColor),
        accentColor: this.normalizeColor(parsed.accentColor, fallback.accentColor),
        surfaceStyle: this.normalizeSurfaceStyle(parsed.surfaceStyle, fallback.surfaceStyle),
        density: this.normalizeDensity(parsed.density, fallback.density),
        reducedMotion: parsed.reducedMotion === true,
        highContrast: parsed.highContrast === true,
        graphStyle: this.normalizeGraphStyle(parsed.graphStyle, fallback.graphStyle),
      };
    } catch (_error) {
      return fallback;
    }
  }

  save(preferences: ThemePreferences): ThemePreferences {
    const normalized = {
      primaryColor: this.normalizeColor(preferences.primaryColor, this.getDefaults().primaryColor),
      accentColor: this.normalizeColor(preferences.accentColor, this.getDefaults().accentColor),
      surfaceStyle: this.normalizeSurfaceStyle(preferences.surfaceStyle, this.getDefaults().surfaceStyle),
      density: this.normalizeDensity(preferences.density, this.getDefaults().density),
      reducedMotion: preferences.reducedMotion === true,
      highContrast: preferences.highContrast === true,
      graphStyle: this.normalizeGraphStyle(preferences.graphStyle, this.getDefaults().graphStyle),
    };

    localStorage.setItem(this.storageKey, JSON.stringify(normalized));
    this.apply(normalized);
    return normalized;
  }

  apply(preferences: ThemePreferences): void {
    const resolved = {
      ...this.getDefaults(),
      ...preferences,
    };
    const root = document.documentElement;
    const body = document.body;

    root.style.setProperty('--accent', resolved.primaryColor);
    root.style.setProperty('--accent-strong', this.darken(resolved.primaryColor, 22));
    root.style.setProperty('--accent-soft', this.hexToRgba(resolved.primaryColor, 0.14));
    root.style.setProperty('--accent-alt', resolved.accentColor);
    root.style.setProperty('--accent-alt-soft', this.hexToRgba(resolved.accentColor, 0.14));

    if (resolved.surfaceStyle === 'solid') {
      root.style.setProperty('--surface', '#ffffff');
      root.style.setProperty('--surface-muted', '#f3f4f8');
    } else {
      root.style.setProperty('--surface', 'rgba(255, 255, 255, 0.82)');
      root.style.setProperty('--surface-muted', '#f6f1e8');
    }

    this.toggleClass(body, 'theme-surface-solid', resolved.surfaceStyle === 'solid');
    this.toggleClass(body, 'theme-density-compact', resolved.density === 'compact');
    this.toggleClass(body, 'theme-motion-reduced', resolved.reducedMotion);
    this.toggleClass(body, 'theme-contrast-strong', resolved.highContrast);
    this.toggleClass(body, 'theme-graph-vivid', resolved.graphStyle === 'vivid');
  }

  initialize(): ThemePreferences {
    const preferences = this.read();
    this.apply(preferences);
    return preferences;
  }

  private toggleClass(element: HTMLElement, className: string, enabled: boolean): void {
    if (!element) {
      return;
    }

    if (enabled) {
      element.classList.add(className);
      return;
    }

    element.classList.remove(className);
  }

  private normalizeColor(value: string | undefined, fallback: string): string {
    const normalized = (value || '').trim();

    if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
      return normalized.toLowerCase();
    }

    return fallback;
  }

  private normalizeSurfaceStyle(value: string | undefined, fallback: ThemeSurfaceStyle): ThemeSurfaceStyle {
    return value === 'solid' || value === 'glass' ? value : fallback;
  }

  private normalizeDensity(value: string | undefined, fallback: ThemeDensity): ThemeDensity {
    return value === 'compact' || value === 'comfortable' ? value : fallback;
  }

  private normalizeGraphStyle(value: string | undefined, fallback: ThemeGraphStyle): ThemeGraphStyle {
    return value === 'soft' || value === 'vivid' ? value : fallback;
  }

  private darken(hexColor: string, amountPercent: number): string {
    const rgb = this.hexToRgb(hexColor);

    if (!rgb) {
      return hexColor;
    }

    const ratio = Math.max(0, Math.min(100, amountPercent)) / 100;
    const darkened = {
      r: Math.round(rgb.r * (1 - ratio)),
      g: Math.round(rgb.g * (1 - ratio)),
      b: Math.round(rgb.b * (1 - ratio)),
    };

    return this.rgbToHex(darkened.r, darkened.g, darkened.b);
  }

  private hexToRgba(hexColor: string, alpha: number): string {
    const rgb = this.hexToRgb(hexColor);

    if (!rgb) {
      return 'rgba(28, 78, 128, 0.14)';
    }

    const normalizedAlpha = Math.max(0, Math.min(1, alpha));
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${normalizedAlpha})`;
  }

  private hexToRgb(hexColor: string): { r: number; g: number; b: number } | null {
    const normalized = (hexColor || '').replace('#', '');

    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
      return null;
    }

    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16),
    };
  }

  private rgbToHex(r: number, g: number, b: number): string {
    const toHex = (value: number) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
