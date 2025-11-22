import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import PartsOrder from "../PartsOrder";
import ModelProxyClass from "./ModelProxyClass";
import RepairOrder from "../RepairOrder";
import Person from "../Person";
import ActivityLogItem from "../ActivityLogItem";
import FileAsset from "../FileAsset";


/**
 * @class PartsOrderBase
 * @extends ModelBaseClass
 * @property {number} id (int64)
 * @property {number} partsOrderNumber (integer) 0=original Parts Order.  1=Supplement #1.  2=Supplement #2.  3=Supplement #3.  Etc.
 * @property {'OrderReview'|'OrderFulfillment'|'OrderReceived'|'RepairCompleted'} stage
 * @property {'CsrReview'|'CsrRejected'|'DealershipProcessing'|'DealershipShipped'|'ShopReceived'|'RepairCompleted'} status
 * @property {[string]} parts
 * @property {boolean} approvalFlag TRUE if approved.  FALSE is rejected.  NULL if not yet reviewed.
 * @property {string} salesOrderNumber
 * @property {Date} dateSubmitted (date and time)
 * @property {Date} dateReviewed (date and time)
 * @property {Date} dateShipped (date and time)
 * @property {Date} dateReceived (date and time)
 * @property {Date} dateCreated (date and time)
 * @property {RepairOrder} repairOrder only set if called via OrderApi::partsOrderSearch() or OrderApi::partsOrderGet()
 * @property {Person} submittedByPerson only set if called via OrderApi::partsOrderGet() OR OrderApi::partsOrderGetAllForRepairOrder()
 * @property {Person} reviewedByPerson only set if called via OrderApi::partsOrderGet() OR OrderApi::partsOrderGetAllForRepairOrder()
 * @property {Person} shippedByPerson only set if called via OrderApi::partsOrderGet() OR OrderApi::partsOrderGetAllForRepairOrder()
 * @property {Person} receivedByPerson only set if called via OrderApi::partsOrderGet() OR OrderApi::partsOrderGetAllForRepairOrder()
 * @property {[ActivityLogItem]} orderReviewActivityLogItems only set if called via OrderApi::partsOrderGet() OR OrderApi::partsOrderGetAllForRepairOrder()
 * @property {[ActivityLogItem]} orderFulfillmentActivityLogItems only set if called via OrderApi::partsOrderGet() OR OrderApi::partsOrderGetAllForRepairOrder()
 * @property {[ActivityLogItem]} orderReceivedActivityLogItems only set if called via OrderApi::partsOrderGet() OR OrderApi::partsOrderGetAllForRepairOrder()
 * @property {[FileAsset]} estimateFileAssets only set if called via OrderApi::partsOrderGet() OR OrderApi::partsOrderGetAllForRepairOrder()
 */
class PartsOrderBase extends ModelBaseClass {
	/**
	 * @type {number} id (int64)
	 */
	id;
	/**
	 * 0=original Parts Order.  1=Supplement #1.  2=Supplement #2.  3=Supplement #3.  Etc.
	 * @type {number} partsOrderNumber (integer)
	 */
	'partsOrderNumber';
	/**
	 * @type {'OrderReview'|'OrderFulfillment'|'OrderReceived'|'RepairCompleted'} stage
	 */
	stage;
	/**
	 * @type {'CsrReview'|'CsrRejected'|'DealershipProcessing'|'DealershipShipped'|'ShopReceived'|'RepairCompleted'} status
	 */
	status;
	/**
	 * @type {[string]} parts
	 */
	parts;
	/**
	 * TRUE if approved.  FALSE is rejected.  NULL if not yet reviewed.
	 * @type {boolean} approvalFlag
	 */
	'approvalFlag';
	/**
	 * @type {string} salesOrderNumber
	 */
	'salesOrderNumber';
	/**
	 * @type {Date} dateSubmitted (date and time)
	 */
	'dateSubmitted';
	/**
	 * @type {Date} dateReviewed (date and time)
	 */
	'dateReviewed';
	/**
	 * @type {Date} dateShipped (date and time)
	 */
	'dateShipped';
	/**
	 * @type {Date} dateReceived (date and time)
	 */
	'dateReceived';
	/**
	 * @type {Date} dateCreated (date and time)
	 */
	'dateCreated';
	/**
	 * only set if called via OrderApi::partsOrderSearch() or OrderApi::partsOrderGet()
	 * @type {RepairOrder} repairOrder
	 */
	'repairOrder';
	/**
	 * only set if called via OrderApi::partsOrderGet() OR OrderApi::partsOrderGetAllForRepairOrder()
	 * @type {Person} submittedByPerson
	 */
	'submittedByPerson';
	/**
	 * only set if called via OrderApi::partsOrderGet() OR OrderApi::partsOrderGetAllForRepairOrder()
	 * @type {Person} reviewedByPerson
	 */
	'reviewedByPerson';
	/**
	 * only set if called via OrderApi::partsOrderGet() OR OrderApi::partsOrderGetAllForRepairOrder()
	 * @type {Person} shippedByPerson
	 */
	'shippedByPerson';
	/**
	 * only set if called via OrderApi::partsOrderGet() OR OrderApi::partsOrderGetAllForRepairOrder()
	 * @type {Person} receivedByPerson
	 */
	'receivedByPerson';
	/**
	 * only set if called via OrderApi::partsOrderGet() OR OrderApi::partsOrderGetAllForRepairOrder()
	 * @type {[ActivityLogItem]} orderReviewActivityLogItems
	 */
	'orderReviewActivityLogItems';
	/**
	 * only set if called via OrderApi::partsOrderGet() OR OrderApi::partsOrderGetAllForRepairOrder()
	 * @type {[ActivityLogItem]} orderFulfillmentActivityLogItems
	 */
	'orderFulfillmentActivityLogItems';
	/**
	 * only set if called via OrderApi::partsOrderGet() OR OrderApi::partsOrderGetAllForRepairOrder()
	 * @type {[ActivityLogItem]} orderReceivedActivityLogItems
	 */
	'orderReceivedActivityLogItems';
	/**
	 * only set if called via OrderApi::partsOrderGet() OR OrderApi::partsOrderGetAllForRepairOrder()
	 * @type {[FileAsset]} estimateFileAssets
	 */
	'estimateFileAssets';

	/**
	 * Instantiates a new instance of PartsOrder based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {PartsOrder}
	 */
	static create(genericObject) {
		const newPartsOrder = new PartsOrder();
		newPartsOrder.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newPartsOrder;
	}

	/**
	 * Instantiates a new array of PartsOrder based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[PartsOrder]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newPartsOrderArray = [];
		genericArray.forEach(genericObject => {
			newPartsOrderArray.push(PartsOrder.create(genericObject));
		});
		return newPartsOrderArray;
	}
}

const _modelDefinition = [
	ModelBaseClass.createModelProperty('id', 'integer'),
	ModelBaseClass.createModelProperty('partsOrderNumber', 'integer'),
	ModelBaseClass.createModelProperty('stage', 'string'),
	ModelBaseClass.createModelProperty('status', 'string'),
	ModelBaseClass.createModelProperty('parts', '[string]'),
	ModelBaseClass.createModelProperty('approvalFlag', 'boolean'),
	ModelBaseClass.createModelProperty('salesOrderNumber', 'string'),
	ModelBaseClass.createModelProperty('dateSubmitted', 'datetime'),
	ModelBaseClass.createModelProperty('dateReviewed', 'datetime'),
	ModelBaseClass.createModelProperty('dateShipped', 'datetime'),
	ModelBaseClass.createModelProperty('dateReceived', 'datetime'),
	ModelBaseClass.createModelProperty('dateCreated', 'datetime'),
	ModelBaseClass.createModelProperty('repairOrder', 'RepairOrder'),
	ModelBaseClass.createModelProperty('submittedByPerson', 'Person'),
	ModelBaseClass.createModelProperty('reviewedByPerson', 'Person'),
	ModelBaseClass.createModelProperty('shippedByPerson', 'Person'),
	ModelBaseClass.createModelProperty('receivedByPerson', 'Person'),
	ModelBaseClass.createModelProperty('orderReviewActivityLogItems', '[ActivityLogItem]'),
	ModelBaseClass.createModelProperty('orderFulfillmentActivityLogItems', '[ActivityLogItem]'),
	ModelBaseClass.createModelProperty('orderReceivedActivityLogItems', '[ActivityLogItem]'),
	ModelBaseClass.createModelProperty('estimateFileAssets', '[FileAsset]'),
];

export default PartsOrderBase;
