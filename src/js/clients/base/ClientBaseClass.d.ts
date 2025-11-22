import DefaultClientOptions from '../DefaultClientOptions'

interface ClientOptions {
  getEndpointUrl?: () => string
  generateRequestOptionsForMethod?: (method: string) => RequestInit
  onApiCall?: (url: string, method: string, request?: any, requestType?: string) => void
  onApiResponse?: (url: string, method: string, request?: any, requestType?: string) => void
  generateDefaultResponseHandler?: () => any
  onApiProcessResponse?: (url: string, method: string, response: Response) => void
  [key: string]: any
}

declare class ClientBaseClass {
  executeApiCall(
    url: string,
    method: string,
    request: any,
    requestType: string | null,
    options?: ClientOptions | null
  ): Promise<Response>

  generateResponseHandler(handler: any, options?: ClientOptions | null): any

  handleUnhandledResponse(response: Response, responseHandler: any): void
}

export default ClientBaseClass

