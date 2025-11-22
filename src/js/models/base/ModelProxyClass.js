import ResultParameter from "../ResultParameter";
import Session from "../Session";
import LoginRequest from "../LoginRequest";
import ForgotPasswordRequest from "../ForgotPasswordRequest";
import UpdatePasswordRequest from "../UpdatePasswordRequest";
import CompleteRegistrationRequest from "../CompleteRegistrationRequest";
import PersonSearchRequest from "../PersonSearchRequest";
import PersonSearchResponse from "../PersonSearchResponse";
import OrganizationSearchRequest from "../OrganizationSearchRequest";
import OrganizationSearchResponse from "../OrganizationSearchResponse";
import PersonEditStatusRequest from "../PersonEditStatusRequest";
import RepairOrderSearchRequest from "../RepairOrderSearchRequest";
import RepairOrderSearchResponse from "../RepairOrderSearchResponse";
import RepairOrderCreateRequest from "../RepairOrderCreateRequest";
import PartsOrderSearchRequest from "../PartsOrderSearchRequest";
import PartsOrderSearchResponse from "../PartsOrderSearchResponse";
import PartsOrderWorkflowActionRequest from "../PartsOrderWorkflowActionRequest";
import ActivityLogItem from "../ActivityLogItem";
import Organization from "../Organization";
import PartsOrder from "../PartsOrder";
import Person from "../Person";
import RegistrationRequest from "../RegistrationRequest";
import Region from "../Region";
import RepairOrder from "../RepairOrder";
import MultiLanguageString from "../MultiLanguageString";
import FileAsset from "../FileAsset";

class ModelProxyClass {
	/**
	 * Constructs a model-based BaseClass subclass based on the className
	 * @param {string} className
	 * @param {object} genericObject
	 * @return {ModelBaseClass}
	 */
	static createByClassName(className, genericObject) {
		switch (className) {
		case 'ResultParameter':
			return ResultParameter.create(genericObject);
		case 'Session':
			return Session.create(genericObject);
		case 'LoginRequest':
			return LoginRequest.create(genericObject);
		case 'ForgotPasswordRequest':
			return ForgotPasswordRequest.create(genericObject);
		case 'UpdatePasswordRequest':
			return UpdatePasswordRequest.create(genericObject);
		case 'CompleteRegistrationRequest':
			return CompleteRegistrationRequest.create(genericObject);
		case 'PersonSearchRequest':
			return PersonSearchRequest.create(genericObject);
		case 'PersonSearchResponse':
			return PersonSearchResponse.create(genericObject);
		case 'OrganizationSearchRequest':
			return OrganizationSearchRequest.create(genericObject);
		case 'OrganizationSearchResponse':
			return OrganizationSearchResponse.create(genericObject);
		case 'PersonEditStatusRequest':
			return PersonEditStatusRequest.create(genericObject);
		case 'RepairOrderSearchRequest':
			return RepairOrderSearchRequest.create(genericObject);
		case 'RepairOrderSearchResponse':
			return RepairOrderSearchResponse.create(genericObject);
		case 'RepairOrderCreateRequest':
			return RepairOrderCreateRequest.create(genericObject);
		case 'PartsOrderSearchRequest':
			return PartsOrderSearchRequest.create(genericObject);
		case 'PartsOrderSearchResponse':
			return PartsOrderSearchResponse.create(genericObject);
		case 'PartsOrderWorkflowActionRequest':
			return PartsOrderWorkflowActionRequest.create(genericObject);
		case 'ActivityLogItem':
			return ActivityLogItem.create(genericObject);
		case 'Organization':
			return Organization.create(genericObject);
		case 'PartsOrder':
			return PartsOrder.create(genericObject);
		case 'Person':
			return Person.create(genericObject);
		case 'RegistrationRequest':
			return RegistrationRequest.create(genericObject);
		case 'Region':
			return Region.create(genericObject);
		case 'RepairOrder':
			return RepairOrder.create(genericObject);
		case 'MultiLanguageString':
			return MultiLanguageString.create(genericObject);
		case 'FileAsset':
			return FileAsset.create(genericObject);
		default:
			throw new Error('Undefined model class: ' + className);
		}
	}
}

export default ModelProxyClass;
