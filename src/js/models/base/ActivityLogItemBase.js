import ModelBaseClass from "@quasidea/oas-client-react/lib/ModelBaseClass";
import ActivityLogItem from "../ActivityLogItem";
import ModelProxyClass from "./ModelProxyClass";
import Person from "../Person";


/**
 * @class ActivityLogItemBase
 * @extends ModelBaseClass
 * @property {number} id (int64)
 * @property {number} partsOrderId (int64)
 * @property {'Submitted'|'Approved'|'Rejected'|'Resubmitted'|'Shipped'|'Unshipped'|'Received'|'Unreceived'} type
 * @property {string} comment
 * @property {Person} person
 * @property {Date} dateCreated (date and time)
 */
class ActivityLogItemBase extends ModelBaseClass {
	/**
	 * @type {number} id (int64)
	 */
	id;
	/**
	 * @type {number} partsOrderId (int64)
	 */
	'partsOrderId';
	/**
	 * @type {'Submitted'|'Approved'|'Rejected'|'Resubmitted'|'Shipped'|'Unshipped'|'Received'|'Unreceived'} type
	 */
	type;
	/**
	 * @type {string} comment
	 */
	comment;
	/**
	 * @type {Person} person
	 */
	person;
	/**
	 * @type {Date} dateCreated (date and time)
	 */
	'dateCreated';

	/**
	 * Instantiates a new instance of ActivityLogItem based on the generic object being passed in (typically from a JSON object)
	 * @param {object} genericObject
	 * @return {ActivityLogItem}
	 */
	static create(genericObject) {
		const newActivityLogItem = new ActivityLogItem();
		newActivityLogItem.instantiate(_modelDefinition, genericObject, ModelProxyClass.createByClassName);
		return newActivityLogItem;
	}

	/**
	 * Instantiates a new array of ActivityLogItem based on the generic array being passed in (typically from a JSON array)
	 * @param {[object]} genericArray
	 * @return {[ActivityLogItem]}
	 */
	static createArray(genericArray) {
		if (genericArray === null) {
			return null;
		}

		const newActivityLogItemArray = [];
		genericArray.forEach(genericObject => {
			newActivityLogItemArray.push(ActivityLogItem.create(genericObject));
		});
		return newActivityLogItemArray;
	}
}

const _modelDefinition = [
	ModelBaseClass.createModelProperty('id', 'integer'),
	ModelBaseClass.createModelProperty('partsOrderId', 'integer'),
	ModelBaseClass.createModelProperty('type', 'string'),
	ModelBaseClass.createModelProperty('comment', 'string'),
	ModelBaseClass.createModelProperty('person', 'Person'),
	ModelBaseClass.createModelProperty('dateCreated', 'datetime'),
];

export default ActivityLogItemBase;
