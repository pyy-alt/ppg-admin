import { useSearch } from '@tanstack/react-router'

export function useRegionSuffix() {
  const search = useSearch({ strict: false})

  const brand = search.brand === 'vw' ? 'vw' : 'audi'          // 自动推断为 'audi' | 'vw'
  const region = search.region === 'canada' ? 'canada' : 'america' // 自动推断为 'america' | 'canada'
  const suffix = region === 'canada' ? '_c.png' : '_a.png'

  return { brand, region, suffix }
}