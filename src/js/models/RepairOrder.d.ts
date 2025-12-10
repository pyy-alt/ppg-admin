import RepairOrderBase from './base/RepairOrderBase';
import type Organization from './Organization';
import type FileAsset from './FileAsset';

/**
 * @class RepairOrder
 * @extends RepairOrderBase
 */
declare class RepairOrder extends RepairOrderBase {
  id?: number;
  shop?: Organization;
  dealership?: Organization;
  roNumber?: string;
  customer?: string;
  vin?: string;
  make?: string;
  year?: number;
  model?: string;
  dateLastSubmitted?: Date | string;
  dateClosed?: Date | string;
  dateCreated?: Date | string;
  structuralMeasurementFileAssets?: FileAsset[];
  preRepairPhotoFileAssets?: FileAsset[];
  postRepairPhotoFileAssets?: FileAsset[];
  
  static create(data: {
    id?: number;
    shop?: Organization | any;
    dealership?: Organization | any;
    roNumber?: string;
    customer?: string;
    vin?: string;
    make?: string;
    year?: number;
    model?: string;
    dateLastSubmitted?: Date | string;
    dateClosed?: Date | string;
    dateCreated?: Date | string;
    structuralMeasurementFileAssets?: FileAsset[] | any[];
    preRepairPhotoFileAssets?: FileAsset[] | any[];
    postRepairPhotoFileAssets?: FileAsset[] | any[];
  }): RepairOrder;
  
  static createArray(data: any[]): RepairOrder[];
}

export default RepairOrder;