import OrganizationSearchRequestBase from './base/OrganizationSearchRequestBase';

/**
 * @class OrganizationSearchRequest
 * @extends OrganizationSearchRequestBase
 */
declare class OrganizationSearchRequest extends OrganizationSearchRequestBase {
  static create(data: {
    type: 'Shop' | 'Dealership';
    filterByShopStatus?: string;
    filterByShopCertification?: string;
    filterByRegionId?: number;
    smartFilter?: string;
    resultParameter?: any;
  }): OrganizationSearchRequest;
  
  static createArray(data: any[]): OrganizationSearchRequest[];
}

export default OrganizationSearchRequest;