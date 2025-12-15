declare const PersonEditStatusRequestActionEnum: {
  readonly DEACTIVATE: 'Deactivate'
  readonly REACTIVATE: 'Reactivate'
  readonly APPROVE_REGISTRATION_REQUEST: 'ApproveRegistrationRequest'
  readonly DECLINE_REGISTRATION_REQUEST: 'DeclineRegistrationRequest'
}

export default PersonEditStatusRequestActionEnum

export type PersonEditStatusRequestAction =
  | 'Deactivate'
  | 'Reactivate'
  | 'ApproveRegistrationRequest'
  | 'DeclineRegistrationRequest'
