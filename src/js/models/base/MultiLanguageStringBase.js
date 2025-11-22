import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import MultiLanguageString from "../MultiLanguageString";
import ModelProxyClass from "./ModelProxyClass";


/**
 * @class MultiLanguageStringBase
 * @extends ModelBaseClass
 * @property {string} en
 * @property {string} fr-CA
 */
class MultiLanguageStringBase extends ModelBaseClass {
	/**
	 * @type {string} en
	 */
	en;
	/**
	 * @type {string} fr-CA
	 */
	'fr-CA';

	/**
	 * Instantiates a new instance of MultiLanguageString based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {MultiLanguageString}
	 */
	static create(genericObject) {
		const newMultiLanguageString = new MultiLanguageString();
		newMultiLanguageString.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newMultiLanguageString;
	}

	/**
	 * Instantiates a new array of MultiLanguageString based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[MultiLanguageString]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newMultiLanguageStringArray = [];
		genericArray.forEach(genericObject => {
			newMultiLanguageStringArray.push(MultiLanguageString.create(genericObject));
		});
		return newMultiLanguageStringArray;
	}
}

const _modelDefinition = [
	ModelBaseClass.createModelProperty('en', 'string'),
	ModelBaseClass.createModelProperty('fr-CA', 'string'),
];

export default MultiLanguageStringBase;
