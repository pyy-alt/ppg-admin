import { useMemo } from 'react'
import { useLocation } from '@tanstack/react-router'

// We can define an object that contains all possible directories
// This way in glob can include all paths
const ALL_IMAGE_GLOB = {
  // Include login all under the directory .png
  login: import.meta.glob('@/assets/img/login/*.png', { eager: true }),
  // Include registration all under the directory .png
  registration: import.meta.glob('@/assets/img/registration/*.png', {
    eager: true,
  }),
}

/**
 * Custom for dynamically loading brand image resources Hook
 * @param {string} directory - The name of the subdirectory where the image is located ('login' or 'registration')
 * @param {string} suffix - the file extension of the image，For example '_a.png' or '_c.png'
 * @returns {string | null} matching image resources URL，If not found, return null
 */
const useBrandLogo = (directory: string, suffix: string): string | null => {
  const location = useLocation()

  return useMemo(() => {
    // 1. Validate directory parameters
    if (!ALL_IMAGE_GLOB[directory as keyof typeof ALL_IMAGE_GLOB]) {
      // eslint-disable-next-line no-console
      console.error(
        `[useBrandLogo] Invalid directory: ${directory}. Must be 'login' or 'registration'.`
      )
      return null
    }

    // 2. Prioritize reading brand prefix from URL query parameters，If not available, use environment variables
    const searchParams = new URLSearchParams(location.search as string)

    let brandFromUrl = searchParams.get('brand')
    if (!brandFromUrl) {
      try {
        const storedBrand = localStorage.getItem('ppg-selected-brand')
        if (storedBrand) {
          const parsed = JSON.parse(storedBrand)
          brandFromUrl = parsed?.brand
        }
      } catch (e) {
        console.error(
          '[useBrandLogo] Failed to parse ppg-selected-brand from localStorage:',
          e
        )
      }
    }
    const BRAND_PREFIX =
      brandFromUrl || import.meta.env.VITE_BRAND || 'audi'

    // 3. Construct target file name：For example audi_a.png or vw_c.png（without path prefix）
    const TARGET_FILENAME = `${BRAND_PREFIX}${suffix}`

    // 4. Get the image module for the corresponding directory
    const imageModules =
      ALL_IMAGE_GLOB[directory as keyof typeof ALL_IMAGE_GLOB]

    // 5. Iterate through the imported modules，Find matches
    for (const path in imageModules) {
      // path Example: '/src/assets/img/login/audi_a.png'
      // Check if the path contains the target file name
      if (path.includes(TARGET_FILENAME)) {
        // Fix: imageModules[path] the type is unknown，needs to be asserted as { default: string }
        const mod = imageModules[path] as { default: string }
        return mod.default
      }
    }

    // 6. If not found，Return null
    // eslint-disable-next-line no-console
    console.warn(
      `[useBrandLogo] Image not found for: ${TARGET_FILENAME} in ${directory} directory.`
    )
    return null
  }, [directory, suffix, location.href]) // Use location.href as a dependency，When URL changes, recalculate
}

export default useBrandLogo
