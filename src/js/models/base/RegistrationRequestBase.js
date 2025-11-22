import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import RegistrationRequest from "../RegistrationRequest";
import ModelProxyClass from "./ModelProxyClass";


/**
 * @class RegistrationRequestBase
 * @extends ModelBaseClass
 * @property {'Shop'|'Dealership'} type
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} shopName
 * @property {string} shopNumber
 * @property {string} dealershipName
 * @property {string} dealershipNumber
 */
class RegistrationRequestBase extends ModelBaseClass {
	/**
	 * @type {'Shop'|'Dealership'} type
	 */
	type;
	/**
	 * @type {string} firstName
	 */
	'firstName';
	/**
	 * @type {string} lastName
	 */
	'lastName';
	/**
	 * @type {string} email
	 */
	email;
	/**
	 * @type {string} shopName
	 */
	'shopName';
	/**
	 * @type {string} shopNumber
	 */
	'shopNumber';
	/**
	 * @type {string} dealershipName
	 */
	'dealershipName';
	/**
	 * @type {string} dealershipNumber
	 */
	'dealershipNumber';

	/**
	 * Instantiates a new instance of RegistrationRequest based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {RegistrationRequest}
	 */
	static create(genericObject) {
		const newRegistrationRequest = new RegistrationRequest();
		newRegistrationRequest.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newRegistrationRequest;
	}

	/**
	 * Instantiates a new array of RegistrationRequest based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[RegistrationRequest]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newRegistrationRequestArray = [];
		genericArray.forEach(genericObject => {
			newRegistrationRequestArray.push(RegistrationRequest.create(genericObject));
		});
		return newRegistrationRequestArray;
	}
}

const _modelDefinition = [
	ModelBaseClass.createModelProperty('type', 'string'),
	ModelBaseClass.createModelProperty('firstName', 'string'),
	ModelBaseClass.createModelProperty('lastName', 'string'),
	ModelBaseClass.createModelProperty('email', 'string'),
	ModelBaseClass.createModelProperty('shopName', 'string'),
	ModelBaseClass.createModelProperty('shopNumber', 'string'),
	ModelBaseClass.createModelProperty('dealershipName', 'string'),
	ModelBaseClass.createModelProperty('dealershipNumber', 'string'),
];

export default RegistrationRequestBase;
