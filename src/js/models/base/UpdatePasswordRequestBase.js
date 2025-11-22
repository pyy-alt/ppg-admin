import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import UpdatePasswordRequest from "../UpdatePasswordRequest";
import ModelProxyClass from "./ModelProxyClass";


/**
 * @class UpdatePasswordRequestBase
 * @extends ModelBaseClass
 * @property {string} currentPassword
 * @property {string} newPassword
 */
class UpdatePasswordRequestBase extends ModelBaseClass {
	/**
	 * @type {string} currentPassword
	 */
	'currentPassword';
	/**
	 * @type {string} newPassword
	 */
	'newPassword';

	/**
	 * Instantiates a new instance of UpdatePasswordRequest based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {UpdatePasswordRequest}
	 */
	static create(genericObject) {
		const newUpdatePasswordRequest = new UpdatePasswordRequest();
		newUpdatePasswordRequest.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newUpdatePasswordRequest;
	}

	/**
	 * Instantiates a new array of UpdatePasswordRequest based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[UpdatePasswordRequest]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newUpdatePasswordRequestArray = [];
		genericArray.forEach(genericObject => {
			newUpdatePasswordRequestArray.push(UpdatePasswordRequest.create(genericObject));
		});
		return newUpdatePasswordRequestArray;
	}
}

const _modelDefinition = [
	ModelBaseClass.createModelProperty('currentPassword', 'string'),
	ModelBaseClass.createModelProperty('newPassword', 'string'),
];

export default UpdatePasswordRequestBase;
