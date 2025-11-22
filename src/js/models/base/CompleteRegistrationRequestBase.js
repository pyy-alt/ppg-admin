import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import CompleteRegistrationRequest from "../CompleteRegistrationRequest";
import ModelProxyClass from "./ModelProxyClass";


/**
 * @class CompleteRegistrationRequestBase
 * @extends ModelBaseClass
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} newPassword
 */
class CompleteRegistrationRequestBase extends ModelBaseClass {
	/**
	 * @type {string} firstName
	 */
	'firstName';
	/**
	 * @type {string} lastName
	 */
	'lastName';
	/**
	 * @type {string} newPassword
	 */
	'newPassword';

	/**
	 * Instantiates a new instance of CompleteRegistrationRequest based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {CompleteRegistrationRequest}
	 */
	static create(genericObject) {
		const newCompleteRegistrationRequest = new CompleteRegistrationRequest();
		newCompleteRegistrationRequest.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newCompleteRegistrationRequest;
	}

	/**
	 * Instantiates a new array of CompleteRegistrationRequest based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[CompleteRegistrationRequest]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newCompleteRegistrationRequestArray = [];
		genericArray.forEach(genericObject => {
			newCompleteRegistrationRequestArray.push(CompleteRegistrationRequest.create(genericObject));
		});
		return newCompleteRegistrationRequestArray;
	}
}

const _modelDefinition = [
	ModelBaseClass.createModelProperty('firstName', 'string'),
	ModelBaseClass.createModelProperty('lastName', 'string'),
	ModelBaseClass.createModelProperty('newPassword', 'string'),
];

export default CompleteRegistrationRequestBase;
