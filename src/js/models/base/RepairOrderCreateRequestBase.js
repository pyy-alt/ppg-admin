import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import RepairOrderCreateRequest from "../RepairOrderCreateRequest";
import ModelProxyClass from "./ModelProxyClass";
import RepairOrder from "../RepairOrder";
import PartsOrder from "../PartsOrder";


/**
 * @class RepairOrderCreateRequestBase
 * @extends ModelBaseClass
 * @property {RepairOrder} repairOrder
 * @property {PartsOrder} partsOrder
 */
class RepairOrderCreateRequestBase extends ModelBaseClass {
	/**
	 * @type {RepairOrder} repairOrder
	 */
	'repairOrder';
	/**
	 * @type {PartsOrder} partsOrder
	 */
	'partsOrder';

	/**
	 * Instantiates a new instance of RepairOrderCreateRequest based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {RepairOrderCreateRequest}
	 */
	static create(genericObject) {
		const newRepairOrderCreateRequest = new RepairOrderCreateRequest();
		newRepairOrderCreateRequest.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newRepairOrderCreateRequest;
	}

	/**
	 * Instantiates a new array of RepairOrderCreateRequest based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[RepairOrderCreateRequest]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newRepairOrderCreateRequestArray = [];
		genericArray.forEach(genericObject => {
			newRepairOrderCreateRequestArray.push(RepairOrderCreateRequest.create(genericObject));
		});
		return newRepairOrderCreateRequestArray;
	}
}

const _modelDefinition = [
	ModelBaseClass.createModelProperty('repairOrder', 'RepairOrder'),
	ModelBaseClass.createModelProperty('partsOrder', 'PartsOrder'),
];

export default RepairOrderCreateRequestBase;
