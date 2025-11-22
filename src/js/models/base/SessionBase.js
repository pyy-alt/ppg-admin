import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import Session from "../Session";
import ModelProxyClass from "./ModelProxyClass";
import Person from "../Person";
import Region from "../Region";


/**
 * @class SessionBase
 * @extends ModelBaseClass
 * @property {string} guid
 * @property {Person} person
 * @property {string} hash
 * @property {string} ipAddress
 * @property {Date} dateLastAccess (date and time)
 * @property {Date} dateCreated (date and time)
 * @property {[string]} shopStatuses only set if user is Network
 * @property {[string]} shopCertifications only set if user is Network
 * @property {[Region]} regions only set if user is Network
 */
class SessionBase extends ModelBaseClass {
	/**
	 * @type {string} guid
	 */
	guid;
	/**
	 * @type {Person} person
	 */
	person;
	/**
	 * @type {string} hash
	 */
	hash;
	/**
	 * @type {string} ipAddress
	 */
	'ipAddress';
	/**
	 * @type {Date} dateLastAccess (date and time)
	 */
	'dateLastAccess';
	/**
	 * @type {Date} dateCreated (date and time)
	 */
	'dateCreated';
	/**
	 * only set if user is Network
	 * @type {[string]} shopStatuses
	 */
	'shopStatuses';
	/**
	 * only set if user is Network
	 * @type {[string]} shopCertifications
	 */
	'shopCertifications';
	/**
	 * only set if user is Network
	 * @type {[Region]} regions
	 */
	regions;

	/**
	 * Instantiates a new instance of Session based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {Session}
	 */
	static create(genericObject) {
		const newSession = new Session();
		newSession.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newSession;
	}

	/**
	 * Instantiates a new array of Session based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[Session]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newSessionArray = [];
		genericArray.forEach(genericObject => {
			newSessionArray.push(Session.create(genericObject));
		});
		return newSessionArray;
	}
}

const _modelDefinition = [
	ModelBaseClass.createModelProperty('guid', 'string'),
	ModelBaseClass.createModelProperty('person', 'Person'),
	ModelBaseClass.createModelProperty('hash', 'string'),
	ModelBaseClass.createModelProperty('ipAddress', 'string'),
	ModelBaseClass.createModelProperty('dateLastAccess', 'datetime'),
	ModelBaseClass.createModelProperty('dateCreated', 'datetime'),
	ModelBaseClass.createModelProperty('shopStatuses', '[string]'),
	ModelBaseClass.createModelProperty('shopCertifications', '[string]'),
	ModelBaseClass.createModelProperty('regions', '[Region]'),
];

export default SessionBase;
