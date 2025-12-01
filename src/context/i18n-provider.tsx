import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { getCookie, setCookie } from '@/lib/cookies'
import { getLanguageCookieName } from '@/config/site'

// 支持的语言类型
export type Language = 'en' | 'fr-CA'

// 翻译数据类型
type Translations = Record<string, any>

// 默认语言
const DEFAULT_LANGUAGE: Language = 'en'
const LANGUAGE_COOKIE_NAME = getLanguageCookieName()
const LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

type I18nProviderState = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
  translations: Translations
}

const initialState: I18nProviderState = {
  language: DEFAULT_LANGUAGE,
  setLanguage: () => null,
  t: (key: string) => key,
  translations: {},
}

const I18nContext = createContext<I18nProviderState>(initialState)

// 动态加载翻译文件
async function loadTranslations(lang: Language): Promise<Translations> {
  try {
    const module = await import(`../locales/${lang}.json`)
    return module.default || module
  } catch (error) {
    console.warn(`Failed to load translations for ${lang}, falling back to English`)
    try {
      const module = await import(`../locales/en.json`)
      return module.default || module
    } catch {
      return {}
    }
  }
}

// 获取嵌套的翻译值
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path
}

// 替换参数
function replaceParams(text: string, params?: Record<string, string | number>): string {
  if (!params) return text
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`{{${key}}}`, String(value)),
    text
  )
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, _setLanguage] = useState<Language>(() => {
    const savedLang = getCookie(LANGUAGE_COOKIE_NAME) as Language
    return savedLang && ['en', 'fr-CA'].includes(savedLang) ? savedLang : DEFAULT_LANGUAGE
  })

  const [translations, setTranslations] = useState<Translations>({})

  // 加载翻译文件
  useEffect(() => {
    loadTranslations(language).then(setTranslations)
  }, [language])

  // 设置语言
  const setLanguage = (lang: Language) => {
    setCookie(LANGUAGE_COOKIE_NAME, lang, LANGUAGE_COOKIE_MAX_AGE)
    _setLanguage(lang)
  }

  // 翻译函数
  const t = useMemo(
    () => (key: string, params?: Record<string, string | number>) => {
      const translation = getNestedValue(translations, key)
      return replaceParams(translation, params)
    },
    [translations]
  )

  const contextValue: I18nProviderState = {
    language,
    setLanguage,
    t,
    translations,
  }

  return <I18nContext value={contextValue}>{children}</I18nContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTranslation() {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider')
  }

  return context
}

