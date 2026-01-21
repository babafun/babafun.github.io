/**
 * Color Contrast Utility
 * 
 * This module provides functions to calculate color contrast ratios
 * and verify WCAG AA compliance for accessibility.
 * 
 * Validates Requirement 9.3: Color contrast ratios between text and backgrounds
 */

/**
 * RGB color representation
 */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * HSL color representation
 */
export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

/**
 * OKLCH color representation
 */
export interface OKLCHColor {
  l: number;
  c: number;
  h: number;
}

/**
 * Contrast ratio result with WCAG compliance information
 */
export interface ContrastResult {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
  level: 'fail' | 'aa' | 'aaa';
}

/**
 * Converts a hex color string to RGB values
 * @param hex - Hex color string (e.g., "#ff0000" or "ff0000")
 * @returns RGB color object
 */
export function hexToRgb(hex: string): RGBColor {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Handle 3-digit hex codes
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  if (hex.length !== 6) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return { r, g, b };
}

/**
 * Converts HSL color to RGB
 * @param hsl - HSL color object
 * @returns RGB color object
 */
export function hslToRgb(hsl: HSLColor): RGBColor {
  const { h, s, l } = hsl;
  const hNorm = h / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;
  
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((hNorm * 6) % 2) - 1));
  const m = lNorm - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (hNorm >= 0 && hNorm < 1/6) {
    r = c; g = x; b = 0;
  } else if (hNorm >= 1/6 && hNorm < 2/6) {
    r = x; g = c; b = 0;
  } else if (hNorm >= 2/6 && hNorm < 3/6) {
    r = 0; g = c; b = x;
  } else if (hNorm >= 3/6 && hNorm < 4/6) {
    r = 0; g = x; b = c;
  } else if (hNorm >= 4/6 && hNorm < 5/6) {
    r = x; g = 0; b = c;
  } else if (hNorm >= 5/6 && hNorm < 1) {
    r = c; g = 0; b = x;
  }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

/**
 * Converts OKLCH color to RGB (approximate conversion)
 * @param oklch - OKLCH color object
 * @returns RGB color object
 */
export function oklchToRgb(oklch: OKLCHColor): RGBColor {
  // This is a simplified conversion for testing purposes
  // In a production app, you'd want to use a proper color space conversion library
  const { l, c, h } = oklch;
  
  // Convert to approximate HSL first
  const hsl: HSLColor = {
    h: h,
    s: Math.min(100, c * 100),
    l: Math.min(100, l * 100)
  };
  
  return hslToRgb(hsl);
}

/**
 * Calculates the relative luminance of an RGB color
 * Based on WCAG 2.1 specification
 * @param rgb - RGB color object
 * @returns Relative luminance value (0-1)
 */
export function getRelativeLuminance(rgb: RGBColor): number {
  const { r, g, b } = rgb;
  
  // Convert to sRGB
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;
  
  // Apply gamma correction
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculates the contrast ratio between two colors
 * Based on WCAG 2.1 specification
 * @param color1 - First color (RGB)
 * @param color2 - Second color (RGB)
 * @returns Contrast ratio (1-21)
 */
export function calculateContrastRatio(color1: RGBColor, color2: RGBColor): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Evaluates contrast ratio against WCAG standards
 * @param ratio - Contrast ratio value
 * @returns Contrast result with WCAG compliance information
 */
export function evaluateContrast(ratio: number): ContrastResult {
  const wcagAA = ratio >= 4.5;
  const wcagAAA = ratio >= 7;
  
  let level: 'fail' | 'aa' | 'aaa';
  if (wcagAAA) {
    level = 'aaa';
  } else if (wcagAA) {
    level = 'aa';
  } else {
    level = 'fail';
  }
  
  return {
    ratio: Math.round(ratio * 100) / 100, // Round to 2 decimal places
    wcagAA,
    wcagAAA,
    level
  };
}

/**
 * Parses a CSS color string and converts to RGB
 * Supports hex, hsl(), and oklch() formats
 * @param colorString - CSS color string
 * @returns RGB color object
 */
export function parseColorString(colorString: string): RGBColor {
  const color = colorString.trim().toLowerCase();
  
  // Handle hex colors
  if (color.startsWith('#')) {
    return hexToRgb(color);
  }
  
  // Handle HSL colors
  const hslMatch = color.match(/hsl\(\s*(\d+)\s+(\d+)%\s+(\d+)%\s*\)/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]);
    const s = parseInt(hslMatch[2]);
    const l = parseInt(hslMatch[3]);
    return hslToRgb({ h, s, l });
  }
  
  // Handle OKLCH colors
  const oklchMatch = color.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+(\d+)\s*\)/);
  if (oklchMatch) {
    const l = parseFloat(oklchMatch[1]);
    const c = parseFloat(oklchMatch[2]);
    const h = parseInt(oklchMatch[3]);
    return oklchToRgb({ l, c, h });
  }
  
  // Handle named colors (basic set)
  const namedColors: Record<string, RGBColor> = {
    'white': { r: 255, g: 255, b: 255 },
    'black': { r: 0, g: 0, b: 0 },
    'red': { r: 255, g: 0, b: 0 },
    'green': { r: 0, g: 128, b: 0 },
    'blue': { r: 0, g: 0, b: 255 },
    'purple': { r: 128, g: 0, b: 128 },
    'yellow': { r: 255, g: 255, b: 0 },
    'cyan': { r: 0, g: 255, b: 255 },
    'magenta': { r: 255, g: 0, b: 255 }
  };
  
  if (namedColors[color]) {
    return namedColors[color];
  }
  
  throw new Error(`Unsupported color format: ${colorString}`);
}

/**
 * Tests contrast between two CSS color strings
 * @param foreground - Foreground color (text)
 * @param background - Background color
 * @returns Contrast result with WCAG compliance
 */
export function testColorContrast(foreground: string, background: string): ContrastResult {
  const fgRgb = parseColorString(foreground);
  const bgRgb = parseColorString(background);
  const ratio = calculateContrastRatio(fgRgb, bgRgb);
  return evaluateContrast(ratio);
}

/**
 * Predefined color pairs from our theme for testing
 */
export const THEME_COLOR_PAIRS = [
  // Main text on backgrounds
  { name: 'Text on main background', fg: 'hsl(266 100% 100%)', bg: 'hsl(271 100% 7%)' },
  { name: 'Text on dark background', fg: 'hsl(266 100% 100%)', bg: 'hsl(265 100% 4%)' },
  { name: 'Text on light background', fg: 'hsl(266 100% 100%)', bg: 'hsl(271 73% 11%)' },
  
  // Muted text on backgrounds
  { name: 'Muted text on main background', fg: 'hsl(266 57% 77%)', bg: 'hsl(271 100% 7%)' },
  { name: 'Muted text on light background', fg: 'hsl(266 57% 77%)', bg: 'hsl(271 73% 11%)' },
  
  // Primary color on backgrounds
  { name: 'Primary on main background', fg: 'hsl(268 100% 80%)', bg: 'hsl(271 100% 7%)' },
  { name: 'Primary on dark background', fg: 'hsl(268 100% 80%)', bg: 'hsl(265 100% 4%)' },
  { name: 'Primary on light background', fg: 'hsl(268 100% 80%)', bg: 'hsl(271 73% 11%)' },
  
  // Secondary color on backgrounds
  { name: 'Secondary on main background', fg: 'hsl(77 51% 50%)', bg: 'hsl(271 100% 7%)' },
  { name: 'Secondary on dark background', fg: 'hsl(77 51% 50%)', bg: 'hsl(265 100% 4%)' },
  
  // Badge colors on dark background (badges use --bg-dark as text color)
  { name: 'Success badge', fg: 'hsl(265 100% 4%)', bg: 'hsl(160 100% 35%)' },
  { name: 'Warning badge', fg: 'hsl(265 100% 4%)', bg: 'hsl(54 100% 27%)' },
  { name: 'Info badge', fg: 'hsl(265 100% 4%)', bg: 'hsl(217 100% 69%)' },
  { name: 'Danger badge', fg: 'hsl(265 100% 4%)', bg: 'hsl(8 84% 66%)' },
  { name: 'Secondary badge', fg: 'hsl(265 100% 4%)', bg: 'hsl(77 51% 50%)' }
];

/**
 * Tests all predefined theme color combinations
 * @returns Array of test results
 */
export function testAllThemeContrasts(): Array<{ name: string; result: ContrastResult }> {
  return THEME_COLOR_PAIRS.map(pair => ({
    name: pair.name,
    result: testColorContrast(pair.fg, pair.bg)
  }));
}

/**
 * Generates a contrast report for all theme colors
 * @returns Formatted report string
 */
export function generateContrastReport(): string {
  const results = testAllThemeContrasts();
  const lines = ['Color Contrast Report', '===================', ''];
  
  let passCount = 0;
  let failCount = 0;
  
  results.forEach(({ name, result }) => {
    const status = result.wcagAA ? '✅ PASS' : '❌ FAIL';
    const level = result.level.toUpperCase();
    lines.push(`${status} ${name}: ${result.ratio}:1 (${level})`);
    
    if (result.wcagAA) {
      passCount++;
    } else {
      failCount++;
    }
  });
  
  lines.push('');
  lines.push(`Summary: ${passCount} passed, ${failCount} failed`);
  lines.push(`Overall compliance: ${failCount === 0 ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`);
  
  return lines.join('\n');
}