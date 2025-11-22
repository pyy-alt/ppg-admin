import AuthenticationApi from "./AuthenticationApi";
import PersonApi from "./PersonApi";
import OrganizationApi from "./OrganizationApi";
import OrderApi from "./OrderApi";
import FileAssetApi from "./FileAssetApi";

/**
 * Use globally to access any of the API Client Methods for the WebService
 */
export default class Client {
}

/**
 * Use in a responseHandler if you want to ignore a given/specific response
 */
export function ignoreResponse() {
}

Client.AuthenticationApi = new AuthenticationApi();
Client.PersonApi = new PersonApi();
Client.OrganizationApi = new OrganizationApi();
Client.OrderApi = new OrderApi();
Client.FileAssetApi = new FileAssetApi();
