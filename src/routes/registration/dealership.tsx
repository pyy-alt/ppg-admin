import { createFileRoute } from '@tanstack/react-router'
import { RegistrationDealership } from '@/features/registration/dealership'

export const Route = createFileRoute('/registration/dealership')({
  component:RegistrationDealership ,
})
