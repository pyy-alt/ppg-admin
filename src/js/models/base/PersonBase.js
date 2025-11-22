import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import Person from "../Person";
import ModelProxyClass from "./ModelProxyClass";
import Organization from "../Organization";
import Region from "../Region";
import RegistrationRequest from "../RegistrationRequest";


/**
 * @class PersonBase
 * @extends ModelBaseClass
 * @property {number} id (int64)
 * @property {'Active'|'Inactive'|'RegistrationRequested'|'Pending'} status
 * @property {'Shop'|'Dealership'|'Csr'|'FieldStaff'|'ProgramAdministrator'} type
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {Organization} shop only set if a Shop user
 * @property {Organization} dealership only set if a Dealership user
 * @property {Region} csrRegion only set if user type is Csr
 * @property {[Region]} fieldStaffRegions only set if user type is FieldStaff
 * @property {RegistrationRequest} registrationRequest only set if a Shop user or a Dealership user.
 * @property {Date} dateApproved (date and time)
 * @property {Date} dateConfirmed (date and time)
 * @property {Date} dateLastAccess (date and time)
 * @property {Date} dateCreated (date and time)
 */
class PersonBase extends ModelBaseClass {
	/**
	 * @type {number} id (int64)
	 */
	id;
	/**
	 * @type {'Active'|'Inactive'|'RegistrationRequested'|'Pending'} status
	 */
	status;
	/**
	 * @type {'Shop'|'Dealership'|'Csr'|'FieldStaff'|'ProgramAdministrator'} type
	 */
	type;
	/**
	 * @type {string} email
	 */
	email;
	/**
	 * @type {string} firstName
	 */
	'firstName';
	/**
	 * @type {string} lastName
	 */
	'lastName';
	/**
	 * only set if a Shop user
	 * @type {Organization} shop
	 */
	shop;
	/**
	 * only set if a Dealership user
	 * @type {Organization} dealership
	 */
	dealership;
	/**
	 * only set if user type is Csr
	 * @type {Region} csrRegion
	 */
	'csrRegion';
	/**
	 * only set if user type is FieldStaff
	 * @type {[Region]} fieldStaffRegions
	 */
	'fieldStaffRegions';
	/**
	 * only set if a Shop user or a Dealership user.
	 * @type {RegistrationRequest} registrationRequest
	 */
	'registrationRequest';
	/**
	 * @type {Date} dateApproved (date and time)
	 */
	'dateApproved';
	/**
	 * @type {Date} dateConfirmed (date and time)
	 */
	'dateConfirmed';
	/**
	 * @type {Date} dateLastAccess (date and time)
	 */
	'dateLastAccess';
	/**
	 * @type {Date} dateCreated (date and time)
	 */
	'dateCreated';

	/**
	 * Instantiates a new instance of Person based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {Person}
	 */
	static create(genericObject) {
		const newPerson = new Person();
		newPerson.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newPerson;
	}

	/**
	 * Instantiates a new array of Person based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[Person]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newPersonArray = [];
		genericArray.forEach(genericObject => {
			newPersonArray.push(Person.create(genericObject));
		});
		return newPersonArray;
	}
}

const _modelDefinition = [
	ModelBaseClass.createModelProperty('id', 'integer'),
	ModelBaseClass.createModelProperty('status', 'string'),
	ModelBaseClass.createModelProperty('type', 'string'),
	ModelBaseClass.createModelProperty('email', 'string'),
	ModelBaseClass.createModelProperty('firstName', 'string'),
	ModelBaseClass.createModelProperty('lastName', 'string'),
	ModelBaseClass.createModelProperty('shop', 'Organization'),
	ModelBaseClass.createModelProperty('dealership', 'Organization'),
	ModelBaseClass.createModelProperty('csrRegion', 'Region'),
	ModelBaseClass.createModelProperty('fieldStaffRegions', '[Region]'),
	ModelBaseClass.createModelProperty('registrationRequest', 'RegistrationRequest'),
	ModelBaseClass.createModelProperty('dateApproved', 'datetime'),
	ModelBaseClass.createModelProperty('dateConfirmed', 'datetime'),
	ModelBaseClass.createModelProperty('dateLastAccess', 'datetime'),
	ModelBaseClass.createModelProperty('dateCreated', 'datetime'),
];

export default PersonBase;
