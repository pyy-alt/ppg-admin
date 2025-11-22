import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import PersonSearchRequest from "../PersonSearchRequest";
import ModelProxyClass from "./ModelProxyClass";
import ResultParameter from "../ResultParameter";


/**
 * @class PersonSearchRequestBase
 * @extends ModelBaseClass
 * @property {'Shop'|'Dealership'|'Network'} type must be set
 * @property {number} organizationId (int64) required if type is Shop or Dealership.  ignored if type is Network
 * @property {boolean} includeInactiveFlag
 * @property {string} smartFilter
 * @property {'Csr'|'FieldStaff'|'ProgramAdministrator'} filterByNetworkRole ignored if type is Shop or Dealership
 * @property {number} filterByRegionId (int64) ignored if type is Shop or Dealership
 * @property {ResultParameter} resultParameter [FirstName,LastName,Email,Role,DateCreated,DateLastAccess,ActiveFlag]
 */
class PersonSearchRequestBase extends ModelBaseClass {
	/**
	 * must be set
	 * @type {'Shop'|'Dealership'|'Network'} type
	 */
	type;
	/**
	 * required if type is Shop or Dealership.  ignored if type is Network
	 * @type {number} organizationId (int64)
	 */
	'organizationId';
	/**
	 * @type {boolean} includeInactiveFlag
	 */
	'includeInactiveFlag';
	/**
	 * @type {string} smartFilter
	 */
	'smartFilter';
	/**
	 * ignored if type is Shop or Dealership
	 * @type {'Csr'|'FieldStaff'|'ProgramAdministrator'} filterByNetworkRole
	 */
	'filterByNetworkRole';
	/**
	 * ignored if type is Shop or Dealership
	 * @type {number} filterByRegionId (int64)
	 */
	'filterByRegionId';
	/**
	 * [FirstName,LastName,Email,Role,DateCreated,DateLastAccess,ActiveFlag]
	 * @type {ResultParameter} resultParameter
	 */
	'resultParameter';

	/**
	 * Instantiates a new instance of PersonSearchRequest based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {PersonSearchRequest}
	 */
	static create(genericObject) {
		const newPersonSearchRequest = new PersonSearchRequest();
		newPersonSearchRequest.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newPersonSearchRequest;
	}

	/**
	 * Instantiates a new array of PersonSearchRequest based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[PersonSearchRequest]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newPersonSearchRequestArray = [];
		genericArray.forEach(genericObject => {
			newPersonSearchRequestArray.push(PersonSearchRequest.create(genericObject));
		});
		return newPersonSearchRequestArray;
	}
}

/**
 * @type {string} OrderByFirstName
 */
PersonSearchRequestBase.OrderByFirstName = 'firstname';

/**
 * @type {string} OrderByLastName
 */
PersonSearchRequestBase.OrderByLastName = 'lastname';

/**
 * @type {string} OrderByEmail
 */
PersonSearchRequestBase.OrderByEmail = 'email';

/**
 * @type {string} OrderByRole
 */
PersonSearchRequestBase.OrderByRole = 'role';

/**
 * @type {string} OrderByDateCreated
 */
PersonSearchRequestBase.OrderByDateCreated = 'datecreated';

/**
 * @type {string} OrderByDateLastAccess
 */
PersonSearchRequestBase.OrderByDateLastAccess = 'datelastaccess';

/**
 * @type {string} OrderByActiveFlag
 */
PersonSearchRequestBase.OrderByActiveFlag = 'activeflag';

const _modelDefinition = [
	ModelBaseClass.createModelProperty('type', 'string'),
	ModelBaseClass.createModelProperty('organizationId', 'integer'),
	ModelBaseClass.createModelProperty('includeInactiveFlag', 'boolean'),
	ModelBaseClass.createModelProperty('smartFilter', 'string'),
	ModelBaseClass.createModelProperty('filterByNetworkRole', 'string'),
	ModelBaseClass.createModelProperty('filterByRegionId', 'integer'),
	ModelBaseClass.createModelProperty('resultParameter', 'ResultParameter'),
];

export default PersonSearchRequestBase;
