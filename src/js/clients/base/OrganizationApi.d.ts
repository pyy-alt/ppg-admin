import ClientBaseClass from './ClientBaseClass';
import type ClientOptions from './ClientOptions';
import type OrganizationSearchResponse from '../../models/OrganizationSearchResponse';
import type Organization from '../../models/Organization';
import type OrganizationSearchRequest from '../../models/OrganizationSearchRequest';

export default class OrganizationApi extends ClientBaseClass {
  /**
   * Searches for organizations in the system
   * @param request 
   * @param responseHandler 
   * @param options optional overrides on the DefaultClientOptions
   */
  search(
    request: OrganizationSearchRequest,
    responseHandler: {
      status200?: (response: OrganizationSearchResponse) => void,
      status403?: (response: string) => void,
      error?: (error: any) => void,
      else?: (statusCode: number, responseText: string) => void
    },
    options?: ClientOptions | null
  ): void;

  /**
   * Gets a Shop organization record
   * @param id 
   * @param responseHandler 
   * @param options optional overrides on the DefaultClientOptions
   */
  shopGet(
    id: string,
    responseHandler: {
      status200?: (response: Organization) => void,
      status403?: (response: string) => void,
      status404?: (response: string) => void,
      error?: (error: any) => void,
      else?: (statusCode: number, responseText: string) => void
    },
    options?: ClientOptions | null
  ): void;

  /**
   * Gets a Dealership organization record
   * @param id 
   * @param responseHandler 
   * @param options optional overrides on the DefaultClientOptions
   */
  dealershipGet(
    id: string,
    responseHandler: {
      status200?: (response: Organization) => void,
      status403?: (response: string) => void,
      status404?: (response: string) => void,
      error?: (error: any) => void,
      else?: (statusCode: number, responseText: string) => void
    },
    options?: ClientOptions | null
  ): void;
}