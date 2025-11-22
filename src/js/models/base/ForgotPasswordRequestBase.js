import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import ForgotPasswordRequest from "../ForgotPasswordRequest";
import ModelProxyClass from "./ModelProxyClass";


/**
 * @class ForgotPasswordRequestBase
 * @extends ModelBaseClass
 * @property {string} email
 */
class ForgotPasswordRequestBase extends ModelBaseClass {
	/**
	 * @type {string} email
	 */
	email;

	/**
	 * Instantiates a new instance of ForgotPasswordRequest based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {ForgotPasswordRequest}
	 */
	static create(genericObject) {
		const newForgotPasswordRequest = new ForgotPasswordRequest();
		newForgotPasswordRequest.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newForgotPasswordRequest;
	}

	/**
	 * Instantiates a new array of ForgotPasswordRequest based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[ForgotPasswordRequest]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newForgotPasswordRequestArray = [];
		genericArray.forEach(genericObject => {
			newForgotPasswordRequestArray.push(ForgotPasswordRequest.create(genericObject));
		});
		return newForgotPasswordRequestArray;
	}
}

const _modelDefinition = [
	ModelBaseClass.createModelProperty('email', 'string'),
];

export default ForgotPasswordRequestBase;
