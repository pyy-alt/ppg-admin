import { useLocation } from '@tanstack/react-router';
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

type Brand = 'audi' | 'vw';
type Region = 'america' | 'canada';

interface BrandContextType {
  brand: Brand;
  region: Region;
  suffix: '_a.png' | '_c.png';
  setBrand: (brand: Brand, region: Region) => void;
}

// Persist to localStorage！
const STORAGE_KEY = 'ppg-selected-brand';
const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [brand, setBrandState] = useState<Brand>('audi');
  const [region, setRegionState] = useState<Region>('america');

  // Key！Restore after refresh
  useEffect(() => {
    const urlBrand = location.search.brand as Brand | undefined;
    const urlRegion = location.search.region as Region | undefined;

    if (urlBrand && urlRegion && ['audi', 'vw'].includes(urlBrand) && ['america', 'canada'].includes(urlRegion)) {
      setBrandState(urlBrand);
      setRegionState(urlRegion);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ brand: urlBrand, region: urlRegion }));
      return;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { brand: b, region: r } = JSON.parse(saved);
        setBrandState(b === 'vw' ? 'vw' : 'audi');
        setRegionState(r === 'canada' ? 'canada' : 'america');
      } catch (e) {
        console.warn('Failed to restore brand from storage');
      }
      return;
    }

    setBrandState('audi');
    setRegionState('america');
  }, [location.search]);

  const setBrand = (newBrand: Brand, newRegion: Region) => {
    setBrandState(newBrand);
    setRegionState(newRegion);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ brand: newBrand, region: newRegion }));
  };

  const suffix = region === 'canada' ? '_c.png' : '_a.png';

  return <BrandContext.Provider value={{ brand, region, suffix, setBrand }}>{children}</BrandContext.Provider>;
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) throw new Error('useBrand must be used within BrandProvider');
  return context;
}
