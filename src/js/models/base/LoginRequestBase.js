import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import LoginRequest from "../LoginRequest";
import ModelProxyClass from "./ModelProxyClass";


/**
 * @class LoginRequestBase
 * @extends ModelBaseClass
 * @property {string} email
 * @property {string} password
 */
class LoginRequestBase extends ModelBaseClass {
	/**
	 * @type {string} email
	 */
	email;
	/**
	 * @type {string} password
	 */
	password;

	/**
	 * Instantiates a new instance of LoginRequest based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {LoginRequest}
	 */
	static create(genericObject) {
		const newLoginRequest = new LoginRequest();
		newLoginRequest.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newLoginRequest;
	}

	/**
	 * Instantiates a new array of LoginRequest based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[LoginRequest]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newLoginRequestArray = [];
		genericArray.forEach(genericObject => {
			newLoginRequestArray.push(LoginRequest.create(genericObject));
		});
		return newLoginRequestArray;
	}
}

const _modelDefinition = [
	ModelBaseClass.createModelProperty('email', 'string'),
	ModelBaseClass.createModelProperty('password', 'string'),
];

export default LoginRequestBase;
