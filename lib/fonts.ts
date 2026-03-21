// Satoshi font — premium, clean, NOT Inter
// Loaded via CDN in globals.css @font-face
export const satoshi = {
  variable: "--font-satoshi",
  className: "font-sans",
  style: {
    fontFamily: '"Satoshi", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }
}

// Keep backward-compatible export name so layout.tsx doesn't break
export const inter = satoshi

// System font fallback for when CDN is completely unavailable
export const systemFont = {
  variable: '--font-system',
  className: 'font-sans',
  style: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }
}

// CSS class name
export const fontClassName = `${satoshi.variable} font-sans`

// For components that need direct access to the font family
export const fontFamily = 'var(--font-satoshi), "Satoshi", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
