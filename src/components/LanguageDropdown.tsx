import { Globe, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en' as const, label: 'English' },
  { code: 'fr-CA' as const, label: 'Français' },
];
export function LanguageDropdown() {
  const { i18n } = useTranslation();
  const currentLang =
    i18n.language || (typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') || 'en' : 'en');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="text-white hover:text-primary">
        <button className="p-2 transition-colors rounded-full hover:bg-white/10">
          <Globe className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => {
              i18n.changeLanguage(lang.code);
              try {
                localStorage.setItem('i18nextLng', lang.code);
              } catch (e) {
                /* ignore */
              }
            }}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{lang.label}</span>
            {currentLang === lang.code && <Check className="w-4 h-4 text-black" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
