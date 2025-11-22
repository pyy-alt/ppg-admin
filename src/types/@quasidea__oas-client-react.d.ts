/**
 * Type declarations for @quasidea/oas-client-react
 */

declare module '@quasidea/oas-client-react' {
  export interface RequestOptions extends RequestInit {
    credentials?: RequestCredentials
    body?: BodyInit | null
    headers?: HeadersInit
    [key: string]: any
  }

  export interface ResponseHandler {
    status200?: (data: any) => void
    status401?: (message: string) => void
    status404?: (message: string) => void
    status409?: (message: string) => void
    status410?: (message: string) => void
    error?: (error: Error) => void
    else?: (statusCode: number, message: string) => void
    [key: string]: any
  }

  export interface ClientOptions {
    getEndpointUrl?: () => string
    generateRequestOptionsForMethod?: (method: string) => RequestOptions
    onApiCall?: (url: string, method: string, request?: any, requestType?: string) => void
    onApiResponse?: (url: string, method: string, request?: any, requestType?: string) => void
    generateDefaultResponseHandler?: () => ResponseHandler
    onApiProcessResponse?: (url: string, method: string, response: Response) => void
    [key: string]: any
  }
}

declare module '@quasidea/oas-client-react/lib/ModelBaseClass' {
  export default class ModelBaseClass {
    static createModelProperty(name: string, type: string): any
    instantiate(modelDefinition: any[], genericObject: any, createByClassName: any): void
  }
}

