import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import PartsOrderSearchResponse from "../PartsOrderSearchResponse";
import ModelProxyClass from "./ModelProxyClass";
import PartsOrder from "../PartsOrder";


/**
 * @class PartsOrderSearchResponseBase
 * @extends ModelBaseClass
 * @property {[PartsOrder]} partOrders
 * @property {number} totalItemCount (int64)
 */
class PartsOrderSearchResponseBase extends ModelBaseClass {
	/**
	 * @type {[PartsOrder]} partOrders
	 */
	'partOrders';
	/**
	 * @type {number} totalItemCount (int64)
	 */
	'totalItemCount';

	/**
	 * Instantiates a new instance of PartsOrderSearchResponse based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {PartsOrderSearchResponse}
	 */
	static create(genericObject) {
		const newPartsOrderSearchResponse = new PartsOrderSearchResponse();
		newPartsOrderSearchResponse.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newPartsOrderSearchResponse;
	}

	/**
	 * Instantiates a new array of PartsOrderSearchResponse based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[PartsOrderSearchResponse]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newPartsOrderSearchResponseArray = [];
		genericArray.forEach(genericObject => {
			newPartsOrderSearchResponseArray.push(PartsOrderSearchResponse.create(genericObject));
		});
		return newPartsOrderSearchResponseArray;
	}
}

const _modelDefinition = [
	ModelBaseClass.createModelProperty('partOrders', '[PartsOrder]'),
	ModelBaseClass.createModelProperty('totalItemCount', 'integer'),
];

export default PartsOrderSearchResponseBase;
