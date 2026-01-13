import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import OrganizationSearchRequest from "../OrganizationSearchRequest";
import ModelProxyClass from "./ModelProxyClass";
import ResultParameter from "../ResultParameter";


/**
 * @class OrganizationSearchRequestBase
 * @extends ModelBaseClass
 * @property {'Shop'|'Dealership'} type must be set
 * @property {string} filterByShopStatus should only be for Shop
 * @property {string} filterByShopCertification should only be for Shop
 * @property {number} filterByRegionId (int64) should only be for Shop
 * @property {string} smartFilter
 * @property {ResultParameter} resultParameter [Name,Number,CountPendingOrders,CountPendingUsers,CountActiveUsers,Status,Certification,DealershipName,RegionName]
 */
class OrganizationSearchRequestBase extends ModelBaseClass {
	/**
	 * must be set
	 * @type {'Shop'|'Dealership'} type
	 */
	type;
	/**
	 * should only be for Shop
	 * @type {string} filterByShopStatus
	 */
	'filterByShopStatus';
	/**
	 * should only be for Shop
	 * @type {string} filterByShopCertification
	 */
	'filterByShopCertification';
	/**
	 * should only be for Shop
	 * @type {number} filterByRegionId (int64)
	 */
	'filterByRegionId';
	/**
	 * @type {string} smartFilter
	 */
	'smartFilter';
	/**
	 * [Name,Number,CountPendingOrders,CountPendingUsers,CountActiveUsers,Status,Certification,DealershipName,RegionName]
	 * @type {ResultParameter} resultParameter
	 */
	'resultParameter';

	/**
	 * Instantiates a new instance of OrganizationSearchRequest based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {OrganizationSearchRequest}
	 */
	static create(genericObject) {
		const newOrganizationSearchRequest = new OrganizationSearchRequest();
		newOrganizationSearchRequest.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newOrganizationSearchRequest;
	}

	/**
	 * Instantiates a new array of OrganizationSearchRequest based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[OrganizationSearchRequest]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newOrganizationSearchRequestArray = [];
		genericArray.forEach(genericObject => {
			newOrganizationSearchRequestArray.push(OrganizationSearchRequest.create(genericObject));
		});
		return newOrganizationSearchRequestArray;
	}
}

/**
 * @type {string} OrderByName
 */
OrganizationSearchRequestBase.OrderByName = 'name';

/**
 * @type {string} OrderByNumber
 */
OrganizationSearchRequestBase.OrderByNumber = 'number';

/**
 * @type {string} OrderByCountPendingOrders
 */
OrganizationSearchRequestBase.OrderByCountPendingOrders = 'countpendingorders';

/**
 * @type {string} OrderByCountPendingUsers
 */
OrganizationSearchRequestBase.OrderByCountPendingUsers = 'countpendingusers';

/**
 * @type {string} OrderByCountActiveUsers
 */
OrganizationSearchRequestBase.OrderByCountActiveUsers = 'countactiveusers';

/**
 * @type {string} OrderByStatus
 */
OrganizationSearchRequestBase.OrderByStatus = 'status';

/**
 * @type {string} OrderByCertification
 */
OrganizationSearchRequestBase.OrderByCertification = 'certification';

/**
 * @type {string} OrderByDealershipName
 */
OrganizationSearchRequestBase.OrderByDealershipName = 'dealershipname';

/**
 * @type {string} OrderByRegionName
 */
OrganizationSearchRequestBase.OrderByRegionName = 'regionname';

const _modelDefinition = [
	ModelBaseClass.createModelProperty('type', 'string'),
	ModelBaseClass.createModelProperty('filterByShopStatus', 'string'),
	ModelBaseClass.createModelProperty('filterByShopCertification', 'string'),
	ModelBaseClass.createModelProperty('filterByRegionId', 'integer'),
	ModelBaseClass.createModelProperty('smartFilter', 'string'),
	ModelBaseClass.createModelProperty('resultParameter', 'ResultParameter'),
];

export default OrganizationSearchRequestBase;
