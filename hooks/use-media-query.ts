'use client'

import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    // Set initial value
    setMatches(media.matches)

    // Update matches when media query changes
    function listener(e: MediaQueryListEvent) {
      setMatches(e.matches)
    }

    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener('change', listener)
    } else {
      // Deprecated 'addListener' for older Safari/iOS
      media.addListener(listener)
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener)
      } else {
        media.removeListener(listener)
      }
    }
  }, [query])

  return matches
}