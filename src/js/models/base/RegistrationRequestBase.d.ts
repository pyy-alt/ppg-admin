import ModelBaseClass from '@quasidea/oas-client-react/lib/ModelBaseClass'
import type RegistrationRequest from '../RegistrationRequest'

declare class RegistrationRequestBase extends ModelBaseClass {
  type?: 'Shop' | 'Dealership'
  firstName?: string
  lastName?: string
  email?: string
  shopName?: string
  shopNumber?: string
  dealershipName?: string
  dealershipNumber?: string

  static create(genericObject: {
    type?: 'Shop' | 'Dealership'
    firstName?: string
    lastName?: string
    email?: string
    shopName?: string
    shopNumber?: string
    dealershipName?: string
    dealershipNumber?: string
  }): RegistrationRequest
  static createArray(
    genericArray: {
      type?: 'Shop' | 'Dealership'
      firstName?: string
      lastName?: string
      email?: string
      shopName?: string
      shopNumber?: string
      dealershipName?: string
      dealershipNumber?: string
    }[] | null
  ): RegistrationRequest[] | null
}

export default RegistrationRequestBase