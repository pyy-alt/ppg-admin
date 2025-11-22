// Copyright (c) 2025 zdb
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// src/components/layout/LanguageDropdown.tsx
'use client'

import { useState } from 'react'
import { getLanguageCookieName } from '@/config/site'
import { Globe, Check } from 'lucide-react'
import { getCookie, setCookie } from '@/lib/cookies'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Copyright (c) 2025 zdb
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// src/components/layout/LanguageDropdown.tsx

// Copyright (c) 2025 zdb
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// src/components/layout/LanguageDropdown.tsx

// Copyright (c) 2025 zdb
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// src/components/layout/LanguageDropdown.tsx

// Copyright (c) 2025 zdb
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// src/components/layout/LanguageDropdown.tsx

// Copyright (c) 2025 zdb
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// src/components/layout/LanguageDropdown.tsx

const languages = [
  { code: 'en', label: 'English' },
  { code: 'fr-CA', label: 'Français' },
]

export function LanguageDropdown() {
  // 从 Cookie 读取语言偏好，默认为 'en'
  const cookieName = getLanguageCookieName()
  const savedLang = getCookie(cookieName) || 'en'
  const [selected, setSelected] = useState(savedLang)

  const handleSelect = (code: string) => {
    setSelected(code)
    // 保存到 Cookie（1年过期）
    const oneYear = 60 * 60 * 24 * 365
    setCookie(cookieName, code, oneYear)
    // TODO: 触发 i18n 切换（待集成 i18n 库）
    // window.location.reload(); // 或使用 i18n 库动态切换
  }

  // const currentLabel =
  //   languages.find((l) => l.code === selected)?.label || 'English'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className='text-white hover:text-primary'>
        <button className='rounded-full p-2 transition-colors hover:bg-white/10'>
          <Globe className='h-5 w-5' />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-40'>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className='flex cursor-pointer items-center justify-between'
          >
            <span>{lang.label}</span>
            {selected === lang.code && <Check className='h-4 w-4 text-black' />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
