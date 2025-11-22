import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import PartsOrderWorkflowActionRequest from "../PartsOrderWorkflowActionRequest";
import ModelProxyClass from "./ModelProxyClass";


/**
 * @class PartsOrderWorkflowActionRequestBase
 * @extends ModelBaseClass
 * @property {number} partsOrderId (int64)
 * @property {'Approved'|'Rejected'|'Resubmitted'|'Shipped'|'Unshipped'|'Received'|'Unreceived'} action
 * @property {string} comment used for Rejected and Resubmitted
 * @property {string} salesOrderNumber required for Approved
 */
class PartsOrderWorkflowActionRequestBase extends ModelBaseClass {
	/**
	 * @type {number} partsOrderId (int64)
	 */
	'partsOrderId';
	/**
	 * @type {'Approved'|'Rejected'|'Resubmitted'|'Shipped'|'Unshipped'|'Received'|'Unreceived'} action
	 */
	action;
	/**
	 * used for Rejected and Resubmitted
	 * @type {string} comment
	 */
	comment;
	/**
	 * required for Approved
	 * @type {string} salesOrderNumber
	 */
	'salesOrderNumber';

	/**
	 * Instantiates a new instance of PartsOrderWorkflowActionRequest based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {PartsOrderWorkflowActionRequest}
	 */
	static create(genericObject) {
		const newPartsOrderWorkflowActionRequest = new PartsOrderWorkflowActionRequest();
		newPartsOrderWorkflowActionRequest.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newPartsOrderWorkflowActionRequest;
	}

	/**
	 * Instantiates a new array of PartsOrderWorkflowActionRequest based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[PartsOrderWorkflowActionRequest]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newPartsOrderWorkflowActionRequestArray = [];
		genericArray.forEach(genericObject => {
			newPartsOrderWorkflowActionRequestArray.push(PartsOrderWorkflowActionRequest.create(genericObject));
		});
		return newPartsOrderWorkflowActionRequestArray;
	}
}

const _modelDefinition = [
	ModelBaseClass.createModelProperty('partsOrderId', 'integer'),
	ModelBaseClass.createModelProperty('action', 'string'),
	ModelBaseClass.createModelProperty('comment', 'string'),
	ModelBaseClass.createModelProperty('salesOrderNumber', 'string'),
];

export default PartsOrderWorkflowActionRequestBase;
