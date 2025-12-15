declare const PersonSearchRequestTypeEnum: {
  readonly SHOP: 'Shop'
  readonly DEALERSHIP: 'Dealership'
  readonly NETWORK: 'Network'
}

export default PersonSearchRequestTypeEnum

export type PersonSearchRequestType = 'Shop' | 'Dealership' | 'Network'
