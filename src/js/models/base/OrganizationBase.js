import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import Organization from "../Organization";
import ModelProxyClass from "./ModelProxyClass";
import Region from "../Region";


/**
 * @class OrganizationBase
 * @extends ModelBaseClass
 * @property {number} id (int64)
 * @property {boolean} activeFlag
 * @property {'Shop'|'Dealership'} type
 * @property {string} shopNumber only set if Shop
 * @property {string} dealershipNumber only set if Dealership
 * @property {string} name
 * @property {Region} region
 * @property {string} address
 * @property {string} city
 * @property {string} state
 * @property {string} zip
 * @property {number} countPendingOrders (integer)
 * @property {number} countActiveUsers (integer)
 * @property {number} countPendingUsers (integer)
 * @property {Organization} sponsorDealership only if this is a Shop -- then this would be the Dealership that is sponsoring this shop
 * @property {string} status only if this is a shop
 * @property {string} certification only if this is a shop
 * @property {Date} dateCreated (date and time)
 */
class OrganizationBase extends ModelBaseClass {
	/**
	 * @type {number} id (int64)
	 */
	id;
	/**
	 * @type {boolean} activeFlag
	 */
	'activeFlag';
	/**
	 * @type {'Shop'|'Dealership'} type
	 */
	type;
	/**
	 * only set if Shop
	 * @type {string} shopNumber
	 */
	'shopNumber';
	/**
	 * only set if Dealership
	 * @type {string} dealershipNumber
	 */
	'dealershipNumber';
	/**
	 * @type {string} name
	 */
	name;
	/**
	 * @type {Region} region
	 */
	region;
	/**
	 * @type {string} address
	 */
	address;
	/**
	 * @type {string} city
	 */
	city;
	/**
	 * @type {string} state
	 */
	state;
	/**
	 * @type {string} zip
	 */
	zip;
	/**
	 * @type {number} countPendingOrders (integer)
	 */
	'countPendingOrders';
	/**
	 * @type {number} countActiveUsers (integer)
	 */
	'countActiveUsers';
	/**
	 * @type {number} countPendingUsers (integer)
	 */
	'countPendingUsers';
	/**
	 * only if this is a Shop -- then this would be the Dealership that is sponsoring this shop
	 * @type {Organization} sponsorDealership
	 */
	'sponsorDealership';
	/**
	 * only if this is a shop
	 * @type {string} status
	 */
	status;
	/**
	 * only if this is a shop
	 * @type {string} certification
	 */
	certification;
	/**
	 * @type {Date} dateCreated (date and time)
	 */
	'dateCreated';

	/**
	 * Instantiates a new instance of Organization based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {Organization}
	 */
	static create(genericObject) {
		const newOrganization = new Organization();
		newOrganization.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newOrganization;
	}

	/**
	 * Instantiates a new array of Organization based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[Organization]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newOrganizationArray = [];
		genericArray.forEach(genericObject => {
			newOrganizationArray.push(Organization.create(genericObject));
		});
		return newOrganizationArray;
	}
}

const _modelDefinition = [
	ModelBaseClass.createModelProperty('id', 'integer'),
	ModelBaseClass.createModelProperty('activeFlag', 'boolean'),
	ModelBaseClass.createModelProperty('type', 'string'),
	ModelBaseClass.createModelProperty('shopNumber', 'string'),
	ModelBaseClass.createModelProperty('dealershipNumber', 'string'),
	ModelBaseClass.createModelProperty('name', 'string'),
	ModelBaseClass.createModelProperty('region', 'Region'),
	ModelBaseClass.createModelProperty('address', 'string'),
	ModelBaseClass.createModelProperty('city', 'string'),
	ModelBaseClass.createModelProperty('state', 'string'),
	ModelBaseClass.createModelProperty('zip', 'string'),
	ModelBaseClass.createModelProperty('countPendingOrders', 'integer'),
	ModelBaseClass.createModelProperty('countActiveUsers', 'integer'),
	ModelBaseClass.createModelProperty('countPendingUsers', 'integer'),
	ModelBaseClass.createModelProperty('sponsorDealership', 'Organization'),
	ModelBaseClass.createModelProperty('status', 'string'),
	ModelBaseClass.createModelProperty('certification', 'string'),
	ModelBaseClass.createModelProperty('dateCreated', 'datetime'),
];

export default OrganizationBase;
