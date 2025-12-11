import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react'

type Brand = 'audi' | 'vw'
type Region = 'america' | 'canada'

interface BrandContextType {
  brand: Brand
  region: Region
  suffix: '_a.png' | '_c.png'
  setBrand: (brand: Brand, region: Region) => void
}

// 持久化到 localStorage！
const STORAGE_KEY = 'ppg-selected-brand'
const BrandContext = createContext<BrandContextType | undefined>(undefined)

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrandState] = useState<Brand>('audi')
  const [region, setRegionState] = useState<Region>('america')

  // 关键！刷新后恢复
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const { brand: b, region: r } = JSON.parse(saved)
        setBrandState(b === 'vw' ? 'vw' : 'audi')
        setRegionState(r === 'canada' ? 'canada' : 'america')
      } catch (e) {
        console.warn('Failed to restore brand from storage')
      }
    }
  }, [])

  const setBrand = (newBrand: Brand, newRegion: Region) => {
    setBrandState(newBrand)
    setRegionState(newRegion)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ brand: newBrand, region: newRegion })
    )
  }

  const suffix = region === 'canada' ? '_c.png' : '_a.png'

  return (
    <BrandContext.Provider value={{ brand, region, suffix, setBrand }}>
      {children}
    </BrandContext.Provider>
  )
}

export function useBrand() {
  const context = useContext(BrandContext)
  if (!context) throw new Error('useBrand must be used within BrandProvider')
  return context
}
