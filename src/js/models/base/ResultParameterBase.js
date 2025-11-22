import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import ResultParameter from "../ResultParameter";
import ModelProxyClass from "./ModelProxyClass";


/**
 * @class ResultParameterBase
 * @extends ModelBaseClass
 * @property {string} resultsOrderBy optional, should conform to the enum that should be defined within the Description of the resultParameter for the request object that is using this
 * @property {boolean} resultsOrderAscending optional, will default to Ascending
 * @property {number} resultsLimitOffset (integer) optional, will default to 0
 * @property {number} resultsLimitCount (integer) optional, will default to unlimited
 */
class ResultParameterBase extends ModelBaseClass {
	/**
	 * optional, should conform to the enum that should be defined within the Description of the resultParameter for the request object that is using this
	 * @type {string} resultsOrderBy
	 */
	'resultsOrderBy';
	/**
	 * optional, will default to Ascending
	 * @type {boolean} resultsOrderAscending
	 */
	'resultsOrderAscending';
	/**
	 * optional, will default to 0
	 * @type {number} resultsLimitOffset (integer)
	 */
	'resultsLimitOffset';
	/**
	 * optional, will default to unlimited
	 * @type {number} resultsLimitCount (integer)
	 */
	'resultsLimitCount';

	/**
	 * Instantiates a new instance of ResultParameter based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {ResultParameter}
	 */
	static create(genericObject) {
		const newResultParameter = new ResultParameter();
		newResultParameter.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newResultParameter;
	}

	/**
	 * Instantiates a new array of ResultParameter based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[ResultParameter]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newResultParameterArray = [];
		genericArray.forEach(genericObject => {
			newResultParameterArray.push(ResultParameter.create(genericObject));
		});
		return newResultParameterArray;
	}
}

const _modelDefinition = [
	ModelBaseClass.createModelProperty('resultsOrderBy', 'string'),
	ModelBaseClass.createModelProperty('resultsOrderAscending', 'boolean'),
	ModelBaseClass.createModelProperty('resultsLimitOffset', 'integer'),
	ModelBaseClass.createModelProperty('resultsLimitCount', 'integer'),
];

export default ResultParameterBase;
