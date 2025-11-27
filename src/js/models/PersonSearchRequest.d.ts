import PersonSearchRequestBase from './base/PersonSearchRequestBase';

/**
 * @class PersonSearchRequest
 * @extends PersonSearchRequestBase
 */
declare class PersonSearchRequest extends PersonSearchRequestBase {
  static create(data: {
    type: 'Shop' | 'Dealership' | 'Network';
    organizationId?: number;
    includeInactiveFlag?: boolean;
    smartFilter?: string;
    filterByNetworkRole?: 'Csr' | 'FieldStaff' | 'ProgramAdministrator';
    filterByRegionId?: number;
    resultParameter?: any;
  }): PersonSearchRequest;
  
  static createArray(data: any[]): PersonSearchRequest[];
}

export default PersonSearchRequest;