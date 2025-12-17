import { useSearch } from '@tanstack/react-router'

export function useRegionSuffix() {
  const search = useSearch({ strict: false})

  const brand = search.brand === 'vw' ? 'vw' : 'audi'          // Automatically inferred as 'audi' | 'vw'
  const region = search.region === 'canada' ? 'canada' : 'america' // Automatically inferred as 'america' | 'canada'
  const suffix = region === 'canada' ? '_c.png' : '_a.png'

  return { brand, region, suffix }
}