declare class DefaultClientOptions {
  static getEndpointUrl(): string
  static generateRequestOptionsForMethod(method: string): RequestInit
  static onApiCall?(url: string, method: string, request?: any, requestType?: string): void
  static onApiResponse?(
    url: string,
    method: string,
    request?: any,
    requestType?: string
  ): void
  static generateDefaultResponseHandler(): any
  static onApiProcessResponse?(
    url: string,
    method: string,
    response: Response
  ): void
}

export default DefaultClientOptions

