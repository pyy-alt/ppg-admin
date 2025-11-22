import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import FileAsset from "../FileAsset";
import ModelProxyClass from "./ModelProxyClass";


/**
 * @class FileAssetBase
 * @extends ModelBaseClass
 * @property {number} id (int64)
 * @property {'StructuralMeasurement'|'PreRepairPhoto'|'PostRepairPhoto'|'Estimate'} fileAssetType
 * @property {string} uploadBase64Data only for when creating/updating a FileAsset by uploading a new file -- this should be set
 * @property {string} viewUrl
 * @property {string} downloadUrl
 * @property {string} filename
 * @property {number} fileSize (integer)
 * @property {string} mimeType
 * @property {Date} dateModified (date and time)
 */
class FileAssetBase extends ModelBaseClass {
	/**
	 * @type {number} id (int64)
	 */
	id;
	/**
	 * @type {'StructuralMeasurement'|'PreRepairPhoto'|'PostRepairPhoto'|'Estimate'} fileAssetType
	 */
	'fileAssetType';
	/**
	 * only for when creating/updating a FileAsset by uploading a new file -- this should be set
	 * @type {string} uploadBase64Data
	 */
	'uploadBase64Data';
	/**
	 * @type {string} viewUrl
	 */
	'viewUrl';
	/**
	 * @type {string} downloadUrl
	 */
	'downloadUrl';
	/**
	 * @type {string} filename
	 */
	filename;
	/**
	 * @type {number} fileSize (integer)
	 */
	'fileSize';
	/**
	 * @type {string} mimeType
	 */
	'mimeType';
	/**
	 * @type {Date} dateModified (date and time)
	 */
	'dateModified';

	/**
	 * Instantiates a new instance of FileAsset based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {FileAsset}
	 */
	static create(genericObject) {
		const newFileAsset = new FileAsset();
		newFileAsset.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newFileAsset;
	}

	/**
	 * Instantiates a new array of FileAsset based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[FileAsset]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newFileAssetArray = [];
		genericArray.forEach(genericObject => {
			newFileAssetArray.push(FileAsset.create(genericObject));
		});
		return newFileAssetArray;
	}
}

const _modelDefinition = [
	ModelBaseClass.createModelProperty('id', 'integer'),
	ModelBaseClass.createModelProperty('fileAssetType', 'string'),
	ModelBaseClass.createModelProperty('uploadBase64Data', 'string'),
	ModelBaseClass.createModelProperty('viewUrl', 'string'),
	ModelBaseClass.createModelProperty('downloadUrl', 'string'),
	ModelBaseClass.createModelProperty('filename', 'string'),
	ModelBaseClass.createModelProperty('fileSize', 'integer'),
	ModelBaseClass.createModelProperty('mimeType', 'string'),
	ModelBaseClass.createModelProperty('dateModified', 'datetime'),
];

export default FileAssetBase;
