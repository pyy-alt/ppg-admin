import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import RepairOrderSearchResponse from "../RepairOrderSearchResponse";
import ModelProxyClass from "./ModelProxyClass";
import RepairOrder from "../RepairOrder";


/**
 * @class RepairOrderSearchResponseBase
 * @extends ModelBaseClass
 * @property {[RepairOrder]} repairOrders
 * @property {number} totalItemCount (int64)
 */
class RepairOrderSearchResponseBase extends ModelBaseClass {
	/**
	 * @type {[RepairOrder]} repairOrders
	 */
	'repairOrders';
	/**
	 * @type {number} totalItemCount (int64)
	 */
	'totalItemCount';

	/**
	 * Instantiates a new instance of RepairOrderSearchResponse based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {RepairOrderSearchResponse}
	 */
	static create(genericObject) {
		const newRepairOrderSearchResponse = new RepairOrderSearchResponse();
		newRepairOrderSearchResponse.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newRepairOrderSearchResponse;
	}

	/**
	 * Instantiates a new array of RepairOrderSearchResponse based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[RepairOrderSearchResponse]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newRepairOrderSearchResponseArray = [];
		genericArray.forEach(genericObject => {
			newRepairOrderSearchResponseArray.push(RepairOrderSearchResponse.create(genericObject));
		});
		return newRepairOrderSearchResponseArray;
	}
}

const _modelDefinition = [
	ModelBaseClass.createModelProperty('repairOrders', '[RepairOrder]'),
	ModelBaseClass.createModelProperty('totalItemCount', 'integer'),
];

export default RepairOrderSearchResponseBase;
