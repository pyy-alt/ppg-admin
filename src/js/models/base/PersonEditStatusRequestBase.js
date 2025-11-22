import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import PersonEditStatusRequest from "../PersonEditStatusRequest";
import ModelProxyClass from "./ModelProxyClass";


/**
 * @class PersonEditStatusRequestBase
 * @extends ModelBaseClass
 * @property {number} personId (int64)
 * @property {'Deactivate'|'Reactivate'|'ApproveRegistrationRequest'|'DeclineRegistrationRequest'} action
 */
class PersonEditStatusRequestBase extends ModelBaseClass {
	/**
	 * @type {number} personId (int64)
	 */
	'personId';
	/**
	 * @type {'Deactivate'|'Reactivate'|'ApproveRegistrationRequest'|'DeclineRegistrationRequest'} action
	 */
	action;

	/**
	 * Instantiates a new instance of PersonEditStatusRequest based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {PersonEditStatusRequest}
	 */
	static create(genericObject) {
		const newPersonEditStatusRequest = new PersonEditStatusRequest();
		newPersonEditStatusRequest.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newPersonEditStatusRequest;
	}

	/**
	 * Instantiates a new array of PersonEditStatusRequest based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[PersonEditStatusRequest]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newPersonEditStatusRequestArray = [];
		genericArray.forEach(genericObject => {
			newPersonEditStatusRequestArray.push(PersonEditStatusRequest.create(genericObject));
		});
		return newPersonEditStatusRequestArray;
	}
}

const _modelDefinition = [
	ModelBaseClass.createModelProperty('personId', 'integer'),
	ModelBaseClass.createModelProperty('action', 'string'),
];

export default PersonEditStatusRequestBase;
