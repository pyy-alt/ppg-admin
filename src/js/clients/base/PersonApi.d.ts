import type Person from '../../models/Person'
import type PersonEditStatusRequest from '../../models/PersonEditStatusRequest'
import type PersonSearchRequest from '../../models/PersonSearchRequest'
import PersonSearchResponse from '../../models/PersonSearchResponse'
import ClientBaseClass from './ClientBaseClass'
import type ClientOptions from './ClientOptions'

interface ResponseHandler {
  status200?: (data: any) => void
  status403?: (message: string) => void
  status404?: (message: string) => void
  status409?: (message: string) => void
  error?: (error: Error) => void
  else?: (statusCode: number, message: string) => void
}

declare class PersonApi extends ClientBaseClass {
  /**
   * Searches for persons in the system
   */
  search(
    request: PersonSearchRequest,
    responseHandler: ResponseHandler,
    options?: ClientOptions | null
  ): void

  /**
   * [ProgramAdministrator] Creates a NETWORK User person record.  ID must be null.  Type is required, and must be one of the Network types (Csr, ProgramAdministrator or FieldStaff only).
   */
  createNetworkUser(
    request: Person,
    responseHandler: ResponseHandler,
    options?: ClientOptions | null
  ): void

  /**
   * Edits a Person record.  ID is required.
   */
  edit(
    request: Person,
    responseHandler: ResponseHandler,
    options?: ClientOptions | null
  ): void

  /**
   * [ProgramAdministrator] Updates a Person's status (e.g. activate, deactivate, approve registration)
   */
  editStatus(
    request: PersonEditStatusRequest,
    responseHandler: ResponseHandler,
    options?: ClientOptions | null
  ): void
}

export default PersonApi
