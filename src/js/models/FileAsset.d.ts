import FileAssetBase from './base/FileAssetBase'
import { FileAssetType } from './enum/FileAssetFileAssetTypeEnum'

/**
 * @class FileAsset
 * @extends FileAssetBase
 */
declare class FileAsset extends FileAssetBase {
  /**
   * @type {number} id (int64)
   */
  id: number

  /**
   * @type {FileAssetType} fileAssetType
   */
  fileAssetType: FileAssetType

  /**
   * only for when creating/updating a FileAsset by uploading a new file -- this should be set
   * @type {string} uploadBase64Data
   */
  uploadBase64Data?: string

  /**
   * @type {string} viewUrl
   */
  viewUrl?: string

  /**
   * @type {string} downloadUrl
   */
  downloadUrl?: string

  /**
   * @type {string} filename
   */
  filename?: string

  /**
   * @type {number} fileSize (integer)
   */
  fileSize?: number

  /**
   * @type {string} mimeType
   */
  mimeType?: string

  /**
   * @type {Date} dateModified (date and time)
   */
  dateModified?: Date

  /**
   * Instantiates a new instance of FileAsset based on the generic object being passed in (typically from a JSON object)
   * @param {object} genericObject
   * @return {FileAsset}
   */
  static create(genericObject: {
    fileAssetType: FileAssetType
    uploadBase64Data?: string
    filename?: string
    fileSize?: number
    mimeType?: string
    [key: string]: any
  }): FileAsset

  /**
   * Instantiates a new array of FileAsset based on the generic array being passed in (typically from a JSON array)
   * @param {[object]} genericArray
   * @return {[FileAsset]}
   */
  static createArray(genericArray: any[]): FileAsset[]
}

export default FileAsset
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

