declare const FileAssetFileAssetTypeEnum: {
  readonly STRUCTURAL_MEASUREMENT: 'StructuralMeasurement'
  readonly PRE_REPAIR_PHOTO: 'PreRepairPhoto'
  readonly POST_REPAIR_PHOTO: 'PostRepairPhoto'
  readonly ESTIMATE: 'Estimate'
}

export default FileAssetFileAssetTypeEnum

export type FileAssetType =
  | 'StructuralMeasurement'
  | 'PreRepairPhoto'
  | 'PostRepairPhoto'
  | 'Estimate'

