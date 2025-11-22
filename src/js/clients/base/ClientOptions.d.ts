declare class ClientOptions {
  getEndpointUrl?: () => string
  generateRequestOptionsForMethod?: (method: string) => RequestInit
  onApiCall?: (url: string, method: string, request?: any, requestType?: string) => void
  onApiResponse?: (url: string, method: string, request?: any, requestType?: string) => void
  generateDefaultResponseHandler?: () => any
  onApiProcessResponse?: (url: string, method: string, response: Response) => void
  [key: string]: any
}

export default ClientOptions

