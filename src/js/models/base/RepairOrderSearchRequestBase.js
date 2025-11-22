import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import RepairOrderSearchRequest from "../RepairOrderSearchRequest";
import ModelProxyClass from "./ModelProxyClass";
import ResultParameter from "../ResultParameter";


/**
 * @class RepairOrderSearchRequestBase
 * @extends ModelBaseClass
 * @property {number} shopId (int64) required
 * @property {string} smartFilter
 * @property {'CsrReview'|'CsrRejected'|'DealershipProcessing'|'DealershipShipped'|'ShopReceived'|'RepairCompleted'} filterByStatus
 * @property {boolean} showRepairCompleted
 * @property {Date} dateLastSubmittedFrom (date only)
 * @property {Date} dateLastSubmittedTo (date only)
 * @property {ResultParameter} resultParameter [RoNumber,SalesOrderNumber,Vin,YearMakeModel,Status,Customer,DateLastSubmitted,DateClosed]
 */
class RepairOrderSearchRequestBase extends ModelBaseClass {
	/**
	 * required
	 * @type {number} shopId (int64)
	 */
	'shopId';
	/**
	 * @type {string} smartFilter
	 */
	'smartFilter';
	/**
	 * @type {'CsrReview'|'CsrRejected'|'DealershipProcessing'|'DealershipShipped'|'ShopReceived'|'RepairCompleted'} filterByStatus
	 */
	'filterByStatus';
	/**
	 * @type {boolean} showRepairCompleted
	 */
	'showRepairCompleted';
	/**
	 * @type {Date} dateLastSubmittedFrom (date only)
	 */
	'dateLastSubmittedFrom';
	/**
	 * @type {Date} dateLastSubmittedTo (date only)
	 */
	'dateLastSubmittedTo';
	/**
	 * [RoNumber,SalesOrderNumber,Vin,YearMakeModel,Status,Customer,DateLastSubmitted,DateClosed]
	 * @type {ResultParameter} resultParameter
	 */
	'resultParameter';

	/**
	 * Instantiates a new instance of RepairOrderSearchRequest based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {RepairOrderSearchRequest}
	 */
	static create(genericObject) {
		const newRepairOrderSearchRequest = new RepairOrderSearchRequest();
		newRepairOrderSearchRequest.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newRepairOrderSearchRequest;
	}

	/**
	 * Instantiates a new array of RepairOrderSearchRequest based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[RepairOrderSearchRequest]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newRepairOrderSearchRequestArray = [];
		genericArray.forEach(genericObject => {
			newRepairOrderSearchRequestArray.push(RepairOrderSearchRequest.create(genericObject));
		});
		return newRepairOrderSearchRequestArray;
	}
}

/**
 * @type {string} OrderByRoNumber
 */
RepairOrderSearchRequestBase.OrderByRoNumber = 'ronumber';

/**
 * @type {string} OrderBySalesOrderNumber
 */
RepairOrderSearchRequestBase.OrderBySalesOrderNumber = 'salesordernumber';

/**
 * @type {string} OrderByVin
 */
RepairOrderSearchRequestBase.OrderByVin = 'vin';

/**
 * @type {string} OrderByYearMakeModel
 */
RepairOrderSearchRequestBase.OrderByYearMakeModel = 'yearmakemodel';

/**
 * @type {string} OrderByStatus
 */
RepairOrderSearchRequestBase.OrderByStatus = 'status';

/**
 * @type {string} OrderByCustomer
 */
RepairOrderSearchRequestBase.OrderByCustomer = 'customer';

/**
 * @type {string} OrderByDateLastSubmitted
 */
RepairOrderSearchRequestBase.OrderByDateLastSubmitted = 'datelastsubmitted';

/**
 * @type {string} OrderByDateClosed
 */
RepairOrderSearchRequestBase.OrderByDateClosed = 'dateclosed';

const _modelDefinition = [
	ModelBaseClass.createModelProperty('shopId', 'integer'),
	ModelBaseClass.createModelProperty('smartFilter', 'string'),
	ModelBaseClass.createModelProperty('filterByStatus', 'string'),
	ModelBaseClass.createModelProperty('showRepairCompleted', 'boolean'),
	ModelBaseClass.createModelProperty('dateLastSubmittedFrom', 'datetime'),
	ModelBaseClass.createModelProperty('dateLastSubmittedTo', 'datetime'),
	ModelBaseClass.createModelProperty('resultParameter', 'ResultParameter'),
];

export default RepairOrderSearchRequestBase;
