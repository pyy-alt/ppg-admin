import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import PartsOrderSearchRequest from "../PartsOrderSearchRequest";
import ModelProxyClass from "./ModelProxyClass";
import ResultParameter from "../ResultParameter";


/**
 * @class PartsOrderSearchRequestBase
 * @extends ModelBaseClass
 * @property {string} smartFilter
 * @property {boolean} filterByWaitingOnMe
 * @property {number} filterByShopId (int64)
 * @property {number} filterByDealershipId (int64)
 * @property {number} filterByPartsOrderNumber (integer) 0=original Parts Order.  1=Supplement #1.  2=Supplement #2.  3=Supplement #3.  Etc.
 * @property {'CsrReview'|'CsrRejected'|'DealershipProcessing'|'DealershipShipped'|'ShopReceived'|'RepairCompleted'} filterByStatus
 * @property {number} filterByRegionId (int64) ignored if type is Shop or Dealership
 * @property {Date} dateSubmittedFrom (date only)
 * @property {Date} dateSubmittedTo (date only)
 * @property {ResultParameter} resultParameter [RoNumber,SalesOrderNumber,PartsOrderNumber,Vin,YearMakeModel,Status,ShopName,DealershipName,Region,DateSubmitted,DateClosed]
 */
class PartsOrderSearchRequestBase extends ModelBaseClass {
	/**
	 * @type {string} smartFilter
	 */
	'smartFilter';
	/**
	 * @type {boolean} filterByWaitingOnMe
	 */
	'filterByWaitingOnMe';
	/**
	 * @type {number} filterByShopId (int64)
	 */
	'filterByShopId';
	/**
	 * @type {number} filterByDealershipId (int64)
	 */
	'filterByDealershipId';
	/**
	 * 0=original Parts Order.  1=Supplement #1.  2=Supplement #2.  3=Supplement #3.  Etc.
	 * @type {number} filterByPartsOrderNumber (integer)
	 */
	'filterByPartsOrderNumber';
	/**
	 * @type {'CsrReview'|'CsrRejected'|'DealershipProcessing'|'DealershipShipped'|'ShopReceived'|'RepairCompleted'} filterByStatus
	 */
	'filterByStatus';
	/**
	 * ignored if type is Shop or Dealership
	 * @type {number} filterByRegionId (int64)
	 */
	'filterByRegionId';
	/**
	 * @type {Date} dateSubmittedFrom (date only)
	 */
	'dateSubmittedFrom';
	/**
	 * @type {Date} dateSubmittedTo (date only)
	 */
	'dateSubmittedTo';
	/**
	 * [RoNumber,SalesOrderNumber,PartsOrderNumber,Vin,YearMakeModel,Status,ShopName,DealershipName,Region,DateSubmitted,DateClosed]
	 * @type {ResultParameter} resultParameter
	 */
	'resultParameter';

	/**
	 * Instantiates a new instance of PartsOrderSearchRequest based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {PartsOrderSearchRequest}
	 */
	static create(genericObject) {
		const newPartsOrderSearchRequest = new PartsOrderSearchRequest();
		newPartsOrderSearchRequest.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newPartsOrderSearchRequest;
	}

	/**
	 * Instantiates a new array of PartsOrderSearchRequest based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[PartsOrderSearchRequest]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newPartsOrderSearchRequestArray = [];
		genericArray.forEach(genericObject => {
			newPartsOrderSearchRequestArray.push(PartsOrderSearchRequest.create(genericObject));
		});
		return newPartsOrderSearchRequestArray;
	}
}

/**
 * @type {string} OrderByRoNumber
 */
PartsOrderSearchRequestBase.OrderByRoNumber = 'ronumber';

/**
 * @type {string} OrderBySalesOrderNumber
 */
PartsOrderSearchRequestBase.OrderBySalesOrderNumber = 'salesordernumber';

/**
 * @type {string} OrderByPartsOrderNumber
 */
PartsOrderSearchRequestBase.OrderByPartsOrderNumber = 'partsordernumber';

/**
 * @type {string} OrderByVin
 */
PartsOrderSearchRequestBase.OrderByVin = 'vin';

/**
 * @type {string} OrderByYearMakeModel
 */
PartsOrderSearchRequestBase.OrderByYearMakeModel = 'yearmakemodel';

/**
 * @type {string} OrderByStatus
 */
PartsOrderSearchRequestBase.OrderByStatus = 'status';

/**
 * @type {string} OrderByShopName
 */
PartsOrderSearchRequestBase.OrderByShopName = 'shopname';

/**
 * @type {string} OrderByDealershipName
 */
PartsOrderSearchRequestBase.OrderByDealershipName = 'dealershipname';

/**
 * @type {string} OrderByRegion
 */
PartsOrderSearchRequestBase.OrderByRegion = 'region';

/**
 * @type {string} OrderByDateSubmitted
 */
PartsOrderSearchRequestBase.OrderByDateSubmitted = 'datesubmitted';

/**
 * @type {string} OrderByDateClosed
 */
PartsOrderSearchRequestBase.OrderByDateClosed = 'dateclosed';

const _modelDefinition = [
	ModelBaseClass.createModelProperty('smartFilter', 'string'),
	ModelBaseClass.createModelProperty('filterByWaitingOnMe', 'boolean'),
	ModelBaseClass.createModelProperty('filterByShopId', 'integer'),
	ModelBaseClass.createModelProperty('filterByDealershipId', 'integer'),
	ModelBaseClass.createModelProperty('filterByPartsOrderNumber', 'integer'),
	ModelBaseClass.createModelProperty('filterByStatus', 'string'),
	ModelBaseClass.createModelProperty('filterByRegionId', 'integer'),
	ModelBaseClass.createModelProperty('dateSubmittedFrom', 'datetime'),
	ModelBaseClass.createModelProperty('dateSubmittedTo', 'datetime'),
	ModelBaseClass.createModelProperty('resultParameter', 'ResultParameter'),
];

export default PartsOrderSearchRequestBase;
