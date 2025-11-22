import { createFileRoute } from '@tanstack/react-router'
import { RegistrationShop } from '@/features/registration/shop'

export const Route = createFileRoute('/registration/shop')({
  component:RegistrationShop ,
})
