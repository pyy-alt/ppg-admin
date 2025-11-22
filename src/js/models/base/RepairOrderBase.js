import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import RepairOrder from "../RepairOrder";
import ModelProxyClass from "./ModelProxyClass";
import Organization from "../Organization";
import FileAsset from "../FileAsset";


/**
 * @class RepairOrderBase
 * @extends ModelBaseClass
 * @property {number} id (int64)
 * @property {Organization} shop
 * @property {Organization} dealership
 * @property {string} roNumber
 * @property {string} customer
 * @property {string} vin
 * @property {string} make
 * @property {number} year (integer)
 * @property {string} model
 * @property {Date} dateLastSubmitted (date and time)
 * @property {Date} dateClosed (date and time)
 * @property {Date} dateCreated (date and time)
 * @property {[FileAsset]} structuralMeasurementFileAssets only set if called via OrderApi::repairOrderGet()
 * @property {[FileAsset]} preRepairPhotoFileAssets only set if called via OrderApi::repairOrderGet()
 * @property {[FileAsset]} postRepairPhotoFileAssets only set if called via OrderApi::repairOrderGet()
 */
class RepairOrderBase extends ModelBaseClass {
	/**
	 * @type {number} id (int64)
	 */
	id;
	/**
	 * @type {Organization} shop
	 */
	shop;
	/**
	 * @type {Organization} dealership
	 */
	dealership;
	/**
	 * @type {string} roNumber
	 */
	'roNumber';
	/**
	 * @type {string} customer
	 */
	customer;
	/**
	 * @type {string} vin
	 */
	vin;
	/**
	 * @type {string} make
	 */
	make;
	/**
	 * @type {number} year (integer)
	 */
	year;
	/**
	 * @type {string} model
	 */
	model;
	/**
	 * @type {Date} dateLastSubmitted (date and time)
	 */
	'dateLastSubmitted';
	/**
	 * @type {Date} dateClosed (date and time)
	 */
	'dateClosed';
	/**
	 * @type {Date} dateCreated (date and time)
	 */
	'dateCreated';
	/**
	 * only set if called via OrderApi::repairOrderGet()
	 * @type {[FileAsset]} structuralMeasurementFileAssets
	 */
	'structuralMeasurementFileAssets';
	/**
	 * only set if called via OrderApi::repairOrderGet()
	 * @type {[FileAsset]} preRepairPhotoFileAssets
	 */
	'preRepairPhotoFileAssets';
	/**
	 * only set if called via OrderApi::repairOrderGet()
	 * @type {[FileAsset]} postRepairPhotoFileAssets
	 */
	'postRepairPhotoFileAssets';

	/**
	 * Instantiates a new instance of RepairOrder based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {RepairOrder}
	 */
	static create(genericObject) {
		const newRepairOrder = new RepairOrder();
		newRepairOrder.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newRepairOrder;
	}

	/**
	 * Instantiates a new array of RepairOrder based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[RepairOrder]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newRepairOrderArray = [];
		genericArray.forEach(genericObject => {
			newRepairOrderArray.push(RepairOrder.create(genericObject));
		});
		return newRepairOrderArray;
	}
}

const _modelDefinition = [
	ModelBaseClass.createModelProperty('id', 'integer'),
	ModelBaseClass.createModelProperty('shop', 'Organization'),
	ModelBaseClass.createModelProperty('dealership', 'Organization'),
	ModelBaseClass.createModelProperty('roNumber', 'string'),
	ModelBaseClass.createModelProperty('customer', 'string'),
	ModelBaseClass.createModelProperty('vin', 'string'),
	ModelBaseClass.createModelProperty('make', 'string'),
	ModelBaseClass.createModelProperty('year', 'integer'),
	ModelBaseClass.createModelProperty('model', 'string'),
	ModelBaseClass.createModelProperty('dateLastSubmitted', 'datetime'),
	ModelBaseClass.createModelProperty('dateClosed', 'datetime'),
	ModelBaseClass.createModelProperty('dateCreated', 'datetime'),
	ModelBaseClass.createModelProperty('structuralMeasurementFileAssets', '[FileAsset]'),
	ModelBaseClass.createModelProperty('preRepairPhotoFileAssets', '[FileAsset]'),
	ModelBaseClass.createModelProperty('postRepairPhotoFileAssets', '[FileAsset]'),
];

export default RepairOrderBase;
