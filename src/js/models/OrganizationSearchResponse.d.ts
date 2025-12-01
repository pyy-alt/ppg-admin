import OrganizationSearchResponseBase from './base/OrganizationSearchResponseBase';

/**
 * @class OrganizationSearchResponse
 * @extends OrganizationSearchResponseBase
 */
declare class OrganizationSearchResponse extends OrganizationSearchResponseBase {
  static create(data: {
    organizations?: any[];
    totalItemCount?: number;
  }): OrganizationSearchResponse;
  
  static createArray(data: any[]): OrganizationSearchResponse[];
}

export default OrganizationSearchResponse;