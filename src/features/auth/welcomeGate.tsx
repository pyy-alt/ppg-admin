import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Globe } from 'lucide-react'
import audiAmerica from '@/assets/img/login/audi_a.png'
import audiCanada from '@/assets/img/login/audi_c.png'
import vwAmerica from '@/assets/img/login/vw_a.png'
import vwCanada from '@/assets/img/login/vw_c.png'
import background from '@/assets/img/login/welcome_bg.png'
import { useBrand } from '@/context/brand-context'

export default function WelcomeGate() {
  const navigate = useNavigate()
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const { setBrand } = useBrand()

  const cards = [
    {
      id: 'audi-america',
      img: audiAmerica,
      alt: 'Audi Authorized Collision Repair - Group of America',
      brandPrefix: 'audi',
      region: 'america',
    },
    {
      id: 'vw-america',
      img: vwAmerica,
      alt: 'Volkswagen Certified Collision Repair Facility Program - Group of America',
      brandPrefix: 'vw',
      region: 'america',
    },
    {
      id: 'audi-canada',
      img: audiCanada,
      alt: 'Audi Authorized Collision Repair - Group of Canada',
      brandPrefix: 'audi',
      region: 'canada',
    },
    {
      id: 'vw-canada',
      img: vwCanada,
      alt: 'Volkswagen Certified Collision Repair Facility Program - Group of Canada',
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
          alt='Collision repair background'
          className='h-full w-full object-cover'
        />
      </div>

      {/* Main content card */}
      <div className='z-10 w-full max-w-6xl px-4 sm:px-8'>
        {/* Top title area */}
        <h1 className='text-center text-5xl font-bold tracking-tight text-white md:text-6xl'>
          Restricted Parts Tracker
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
          <button className='transition hover:text-gray-600'>English</button>
          <span>|</span>
          <button className='text-gray-500 transition hover:text-gray-700'>
            Français
          </button>
        </div>
      </div>
    </div>
  )
}
