// import { useState } from 'react'
// import { getLanguageCookieName } from '@/config/site'
import { Globe, Check } from 'lucide-react'
// import { getCookie, setCookie } from '@/lib/cookies'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslation } from '@/context/i18n-provider'

const languages = [
  { code: 'en' as const, label: 'English' },
  { code: 'fr-CA' as const, label: 'Français' },
]
export function LanguageDropdown() {
  // From Cookie Read language preferences，Default is 'en'
  // const cookieName = getLanguageCookieName()
  // const savedLang = getCookie(cookieName) || 'en'
  // const [selected, setSelected] = useState(savedLang)
  const { language, setLanguage } = useTranslation()


  // const handleSelect = (code: string) => {
  //   setSelected(code)
  //   // Save to Cookie（1Year expiration）
  //   const oneYear = 60 * 60 * 24 * 365
  //   setCookie(cookieName, code, oneYear)
  //   // TODO: Trigger i18n Switch（Pending integration i18n Library）
  //   // window.location.reload(); // or use i18n Dynamic library switching
  // }

  // const currentLabel =
  //   languages.find((l) => l.code === selected)?.label || 'English'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className='hover:text-primary text-white'>
        <button className='rounded-full p-2 transition-colors hover:bg-white/10'>
          <Globe className='h-5 w-5' />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-40'>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className='flex cursor-pointer items-center justify-between'
          >
            <span>{lang.label}</span>
            {language === lang.code && <Check className='h-4 w-4 text-black' />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
