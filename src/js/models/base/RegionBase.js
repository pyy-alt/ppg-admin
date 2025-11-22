import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import Region from "../Region";
import ModelProxyClass from "./ModelProxyClass";


/**
 * @class RegionBase
 * @extends ModelBaseClass
 * @property {number} id (int64)
 * @property {string} name
 */
class RegionBase extends ModelBaseClass {
	/**
	 * @type {number} id (int64)
	 */
	id;
	/**
	 * @type {string} name
	 */
	name;

	/**
	 * Instantiates a new instance of Region based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {Region}
	 */
	static create(genericObject) {
		const newRegion = new Region();
		newRegion.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newRegion;
	}

	/**
	 * Instantiates a new array of Region based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[Region]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newRegionArray = [];
		genericArray.forEach(genericObject => {
			newRegionArray.push(Region.create(genericObject));
		});
		return newRegionArray;
	}
}

const _modelDefinition = [
	ModelBaseClass.createModelProperty('id', 'integer'),
	ModelBaseClass.createModelProperty('name', 'string'),
];

export default RegionBase;
