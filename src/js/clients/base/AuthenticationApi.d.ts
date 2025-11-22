import ClientBaseClass from './ClientBaseClass'
import Session from '../../models/Session'
import type LoginRequest from '../../models/LoginRequest'
import type ClientOptions from './ClientOptions'

interface ResponseHandler {
  status200?: (data: any) => void
  status401?: (message: string) => void
  status404?: (message: string) => void
  status409?: (message: string) => void
  status410?: (message: string) => void
  error?: (error: Error) => void
  else?: (statusCode: number, message: string) => void
}

declare class AuthenticationApi extends ClientBaseClass {
  /**
   * Logs a user into the system
   */
  login(
    request: LoginRequest,
    responseHandler: ResponseHandler,
    options?: ClientOptions | null
  ): void

  /**
   * Logs a user out of the system
   */
  logout(
    responseHandler: ResponseHandler,
    options?: ClientOptions | null
  ): void

  /**
   * Attempts to trigger a Forgot / Reset Password workflow
   */
  forgotPassword(
    request: any,
    responseHandler: ResponseHandler,
    options?: ClientOptions | null
  ): void

  /**
   * Updates the user's password
   */
  updatePassword(
    request: any,
    responseHandler: ResponseHandler,
    options?: ClientOptions | null
  ): void

  /**
   * Creates and logs in a user session based on an emailed link
   */
  sessionCreate(
    id: string,
    guid: string,
    hash: string,
    responseHandler: ResponseHandler,
    options?: ClientOptions | null
  ): void

  /**
   * Retrieves the current session for the logged in user
   */
  sessionGetCurrent(
    responseHandler: ResponseHandler,
    options?: ClientOptions | null
  ): void

  /**
   * Initiates a registration request for a new Shop user
   */
  registrationRequestShop(
    request: any,
    responseHandler: ResponseHandler,
    options?: ClientOptions | null
  ): void

  /**
   * Initiates a registration request for a new Dealership user
   */
  registrationRequestDealership(
    request: any,
    responseHandler: ResponseHandler,
    options?: ClientOptions | null
  ): void

  /**
   * Completes an approved registration request by setting the user's password
   */
  registrationComplete(
    request: any,
    responseHandler: ResponseHandler,
    options?: ClientOptions | null
  ): void
}

export default AuthenticationApi

