import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Globe } from 'lucide-react'
import audiAmerica from '@/assets/img/login/audi_a.png'
import audiCanada from '@/assets/img/login/audi_c.png'
import vwAmerica from '@/assets/img/login/vw_a.png'
import vwCanada from '@/assets/img/login/vw_c.png'
import background from '@/assets/img/login/welcome_bg.png'
import { useBrand } from '@/context/brand-context'
import { useTranslation } from 'react-i18next'

export default function WelcomeGate() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const { setBrand } = useBrand()

  const cards = [
    {
      id: 'audi-america',
      img: audiAmerica,
      alt: t('auth.welcomeGate.audiAmerica'),
      brandPrefix: 'audi',
      region: 'america',
    },
    {
      id: 'vw-america',
      img: vwAmerica,
      alt: t('auth.welcomeGate.vwAmerica'),
      brandPrefix: 'vw',
      region: 'america',
    },
    {
      id: 'audi-canada',
      img: audiCanada,
      alt: t('auth.welcomeGate.audiCanada'),
      brandPrefix: 'audi',
      region: 'canada',
    },
    {
      id: 'vw-canada',
      img: vwCanada,
      alt: t('auth.welcomeGate.vwCanada'),
      brandPrefix: 'vw',
      region: 'canada',
    },
  ]

  const handleCardClick = (card: (typeof cards)[0]) => {
    setBrand(card.brandPrefix as 'audi' | 'vw', card.region as 'america' | 'canada')
    setSelectedCard(card.id)
    // Redirect to login page，Pass URL Parameter passing brand information
    navigate({
      to: '/login',
      search: {
        brand: card.brandPrefix as 'audi' | 'vw',
        region: card.region as 'america' | 'canada',
      },
      replace: false, // Change to false，Keep history
    })
  }

  return (
    <div className='bg-background relative flex min-h-screen flex-col items-center justify-center'>
      {/* Background image + Dark overlay */}
      <div className='absolute inset-0'>
        <img
          src={background}
          alt={t('auth.welcomeGate.backgroundAlt')}
          className='h-full w-full object-cover'
        />
      </div>

      {/* Main content card */}
      <div className='z-10 w-full max-w-6xl px-4 sm:px-8'>
        {/* Top title area */}
        <h1 className='text-center text-5xl font-bold tracking-tight text-white md:text-6xl'>
          {t('auth.welcomeGate.title')}
        </h1>
        {/* Four-square certification logo */}
        <div className='mt-10 grid grid-cols-2 gap-6'>
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`flex cursor-pointer flex-col items-center space-y-4 rounded-lg bg-white py-5 transition-all duration-300 ${
                selectedCard === card.id
                  ? 'scale-105 border-2 border-dashed border-blue-500'
                  : 'hover:scale-105'
              }`}
            >
              <img
                src={card.img}
                alt={card.alt}
                className='h-40 w-90 object-fill drop-shadow-lg'
              />
            </div>
          ))}
        </div>
      </div>
      {/* Bottom language switch */}
      <div className='z-10 mt-10 flex items-center justify-center gap-4 text-white'>
        <Globe className='h-5 w-5' />
        <div className='flex items-center gap-4 text-sm font-medium'>
          <button className='transition hover:text-gray-600'>{t('auth.welcomeGate.language.english')}</button>
          <span>|</span>
          <button className='text-gray-500 transition hover:text-gray-700'>
            {t('auth.welcomeGate.language.french')}
          </button>
        </div>
      </div>
    </div>
  )
}
