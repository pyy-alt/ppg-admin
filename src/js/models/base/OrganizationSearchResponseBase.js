import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import OrganizationSearchResponse from "../OrganizationSearchResponse";
import ModelProxyClass from "./ModelProxyClass";
import Organization from "../Organization";


/**
 * @class OrganizationSearchResponseBase
 * @extends ModelBaseClass
 * @property {[Organization]} organizations
 * @property {number} totalItemCount (int64)
 */
class OrganizationSearchResponseBase extends ModelBaseClass {
	/**
	 * @type {[Organization]} organizations
	 */
	organizations;
	/**
	 * @type {number} totalItemCount (int64)
	 */
	'totalItemCount';

	/**
	 * Instantiates a new instance of OrganizationSearchResponse based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {OrganizationSearchResponse}
	 */
	static create(genericObject) {
		const newOrganizationSearchResponse = new OrganizationSearchResponse();
		newOrganizationSearchResponse.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newOrganizationSearchResponse;
	}

	/**
	 * Instantiates a new array of OrganizationSearchResponse based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[OrganizationSearchResponse]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newOrganizationSearchResponseArray = [];
		genericArray.forEach(genericObject => {
			newOrganizationSearchResponseArray.push(OrganizationSearchResponse.create(genericObject));
		});
		return newOrganizationSearchResponseArray;
	}
}

const _modelDefinition = [
	ModelBaseClass.createModelProperty('organizations', '[Organization]'),
	ModelBaseClass.createModelProperty('totalItemCount', 'integer'),
];

export default OrganizationSearchResponseBase;
