import { useLocation } from '@tanstack/react-router';
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type Brand = 'audi' | 'vw';
type Region = 'america' | 'canada';
type BrandConfig = 'audi' | 'audica' | 'vw' | 'vwca';

interface BrandContextType {
  brand: Brand;
  region: Region;
  suffix: '_a.png' | '_c.png';
  setBrand: (brand: Brand, region: Region) => void;
}

// Parse brand config from environment variable
function parseBrandConfig(config: BrandConfig): { brand: Brand; region: Region } {
  switch (config) {
    case 'audi':
      return { brand: 'audi', region: 'america' };
    case 'audica':
      return { brand: 'audi', region: 'canada' };
    case 'vw':
      return { brand: 'vw', region: 'america' };
    case 'vwca':
      return { brand: 'vw', region: 'canada' };
    default:
      console.warn(`Unknown brand config: ${config}, defaulting to audi`);
      return { brand: 'audi', region: 'america' };
  }
}

// Get brand configuration from environment variable
function getBrandFromEnv(): { brand: Brand; region: Region } {
  const envBrand = import.meta.env.VITE_BRAND as BrandConfig | undefined;
  
  if (envBrand && ['audi', 'audica', 'vw', 'vwca'].includes(envBrand)) {
    return parseBrandConfig(envBrand);
  }
  
  // Default to audi if not set
  return { brand: 'audi', region: 'america' };
}

// Persist to localStorage！
const STORAGE_KEY = 'ppg-selected-brand';
const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const envConfig = getBrandFromEnv();
  const [brand, setBrandState] = useState<Brand>(envConfig.brand);
  const [region, setRegionState] = useState<Region>(envConfig.region);
  const { i18n } = useTranslation();

  // Key！Restore after refresh
  useEffect(() => {
    const urlBrand = location.search.brand as Brand | undefined;
    const urlRegion = location.search.region as Region | undefined;
    const urlLang =  (location.search as Record<string, unknown>).lang as string | undefined

    if (urlLang) {
      const code = urlLang === 'fr' ? 'fr-CA' : 'en';
      i18n.changeLanguage(code);
    }

    // Priority 1: URL parameters (for testing/preview)
    if (urlBrand && urlRegion && ['audi', 'vw'].includes(urlBrand) && ['america', 'canada'].includes(urlRegion)) {
      setBrandState(urlBrand);
      setRegionState(urlRegion);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ brand: urlBrand, region: urlRegion }));
      return;
    }

    // Priority 2: Environment variable (production configuration)
    const envBrandConfig = import.meta.env.VITE_BRAND as BrandConfig | undefined;
    if (envBrandConfig && ['audi', 'audica', 'vw', 'vwca'].includes(envBrandConfig)) {
      const { brand: envBrand, region: envRegion } = parseBrandConfig(envBrandConfig);
      setBrandState(envBrand);
      setRegionState(envRegion);
      // Don't save to localStorage if using env config (so it remains consistent)
      return;
    }

    // Priority 3: localStorage (for user preference if no env config)
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

    // Priority 4: Default fallback
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
