import { useEffect, useState } from 'react'

export function useResponsiveLayout(mobileBreakpoint = 760): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === 'undefined' ? false : window.innerWidth <= mobileBreakpoint,
  )

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const media = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`)
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [mobileBreakpoint])

  return isMobile
}

export default useResponsiveLayout
