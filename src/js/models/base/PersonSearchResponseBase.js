import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import PersonSearchResponse from "../PersonSearchResponse";
import ModelProxyClass from "./ModelProxyClass";
import Person from "../Person";


/**
 * @class PersonSearchResponseBase
 * @extends ModelBaseClass
 * @property {[Person]} persons
 * @property {number} totalItemCount (int64)
 */
class PersonSearchResponseBase extends ModelBaseClass {
	/**
	 * @type {[Person]} persons
	 */
	persons;
	/**
	 * @type {number} totalItemCount (int64)
	 */
	'totalItemCount';

	/**
	 * Instantiates a new instance of PersonSearchResponse based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {PersonSearchResponse}
	 */
	static create(genericObject) {
		const newPersonSearchResponse = new PersonSearchResponse();
		newPersonSearchResponse.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newPersonSearchResponse;
	}

	/**
	 * Instantiates a new array of PersonSearchResponse based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[PersonSearchResponse]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newPersonSearchResponseArray = [];
		genericArray.forEach(genericObject => {
			newPersonSearchResponseArray.push(PersonSearchResponse.create(genericObject));
		});
		return newPersonSearchResponseArray;
	}
}

const _modelDefinition = [
	ModelBaseClass.createModelProperty('persons', '[Person]'),
	ModelBaseClass.createModelProperty('totalItemCount', 'integer'),
];

export default PersonSearchResponseBase;
