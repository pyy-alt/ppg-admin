import ClientBaseClass from "./ClientBaseClass";
import DefaultClientOptions from "../DefaultClientOptions";
import PersonSearchResponse from "../../models/PersonSearchResponse";
import Person from "../../models/Person";

export default class PersonApi extends ClientBaseClass {
	/**
	 * Searches for persons in the system
	 * @param {PersonSearchRequest} request
	 * @param {{status200: function(PersonSearchResponse), status403: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	search(request, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/person/search';

		// noinspection Duplicates
		this.executeApiCall(url, 'post', request, 'json', options)
			.then(response => {
				if (options) {
					if (options.onApiProcessResponse) options.onApiProcessResponse(url, 'post', response);
				} else if (DefaultClientOptions.onApiProcessResponse) {
					DefaultClientOptions.onApiProcessResponse(url, 'post', response);
				}

				switch (response.status) {
				case 200:
					if (responseHandler.status200) {
						response.json()
							.then(responseJson => {
								responseHandler.status200(PersonSearchResponse.create(responseJson));
							})
							.catch(responseHandler.error);
						return;
					}
					break;
				case 403:
					if (responseHandler.status403) {
						response.text()
							.then(responseText => {
								responseHandler.status403(responseText);
							})
							.catch(responseHandler.error);
						return;
					}
					break;
				}

				// If we are here, we basically have a response statusCode that we were npt expecting or are not set to handle
				// Go ahead and fall back to the catch-all
				this.handleUnhandledResponse(response, responseHandler);
			})
			.catch(error => {
				responseHandler.error(error);
			});
	}

	/**
	 * [ProgramAdministrator] Creates a NETWORK User person record.  ID must be null.  Type is required, and must be one of the Network types (Csr, ProgramAdministrator or FieldStaff only).
	 * @param {Person} request
	 * @param {{status200: function(Person), status403: function(string), status404: function(string), status409: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	createNetworkUser(request, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/person/create_network_user';

		// noinspection Duplicates
		this.executeApiCall(url, 'post', request, 'json', options)
			.then(response => {
				if (options) {
					if (options.onApiProcessResponse) options.onApiProcessResponse(url, 'post', response);
				} else if (DefaultClientOptions.onApiProcessResponse) {
					DefaultClientOptions.onApiProcessResponse(url, 'post', response);
				}

				switch (response.status) {
				case 200:
					if (responseHandler.status200) {
						response.json()
							.then(responseJson => {
								responseHandler.status200(Person.create(responseJson));
							})
							.catch(responseHandler.error);
						return;
					}
					break;
				case 403:
					if (responseHandler.status403) {
						response.text()
							.then(responseText => {
								responseHandler.status403(responseText);
							})
							.catch(responseHandler.error);
						return;
					}
					break;
				case 404:
					if (responseHandler.status404) {
						response.text()
							.then(responseText => {
								responseHandler.status404(responseText);
							})
							.catch(responseHandler.error);
						return;
					}
					break;
				case 409:
					if (responseHandler.status409) {
						response.text()
							.then(responseText => {
								responseHandler.status409(responseText);
							})
							.catch(responseHandler.error);
						return;
					}
					break;
				}

				// If we are here, we basically have a response statusCode that we were npt expecting or are not set to handle
				// Go ahead and fall back to the catch-all
				this.handleUnhandledResponse(response, responseHandler);
			})
			.catch(error => {
				responseHandler.error(error);
			});
	}

	/**
	 * Edits a Person record.  ID is required.
	 * @param {Person} request
	 * @param {{status200: function(Person), status403: function(string), status404: function(string), status409: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	edit(request, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/person/edit';

		// noinspection Duplicates
		this.executeApiCall(url, 'post', request, 'json', options)
			.then(response => {
				if (options) {
					if (options.onApiProcessResponse) options.onApiProcessResponse(url, 'post', response);
				} else if (DefaultClientOptions.onApiProcessResponse) {
					DefaultClientOptions.onApiProcessResponse(url, 'post', response);
				}

				switch (response.status) {
				case 200:
					if (responseHandler.status200) {
						response.json()
							.then(responseJson => {
								responseHandler.status200(Person.create(responseJson));
							})
							.catch(responseHandler.error);
						return;
					}
					break;
				case 403:
					if (responseHandler.status403) {
						response.text()
							.then(responseText => {
								responseHandler.status403(responseText);
							})
							.catch(responseHandler.error);
						return;
					}
					break;
				case 404:
					if (responseHandler.status404) {
						response.text()
							.then(responseText => {
								responseHandler.status404(responseText);
							})
							.catch(responseHandler.error);
						return;
					}
					break;
				case 409:
					if (responseHandler.status409) {
						response.text()
							.then(responseText => {
								responseHandler.status409(responseText);
							})
							.catch(responseHandler.error);
						return;
					}
					break;
				}

				// If we are here, we basically have a response statusCode that we were npt expecting or are not set to handle
				// Go ahead and fall back to the catch-all
				this.handleUnhandledResponse(response, responseHandler);
			})
			.catch(error => {
				responseHandler.error(error);
			});
	}

	/**
	 * [ProgramAdministrator] Updates a Person's status (e.g. activate, deactivate, approve registration)
	 * @param {PersonEditStatusRequest} request
	 * @param {{status200: function(string), status403: function(string), status404: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	editStatus(request, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/person/edit_status';

		// noinspection Duplicates
		this.executeApiCall(url, 'post', request, 'json', options)
			.then(response => {
				if (options) {
					if (options.onApiProcessResponse) options.onApiProcessResponse(url, 'post', response);
				} else if (DefaultClientOptions.onApiProcessResponse) {
					DefaultClientOptions.onApiProcessResponse(url, 'post', response);
				}

				switch (response.status) {
				case 200:
					if (responseHandler.status200) {
						response.text()
							.then(responseText => {
								responseHandler.status200(responseText);
							})
							.catch(responseHandler.error);
						return;
					}
					break;
				case 403:
					if (responseHandler.status403) {
						response.text()
							.then(responseText => {
								responseHandler.status403(responseText);
							})
							.catch(responseHandler.error);
						return;
					}
					break;
				case 404:
					if (responseHandler.status404) {
						response.text()
							.then(responseText => {
								responseHandler.status404(responseText);
							})
							.catch(responseHandler.error);
						return;
					}
					break;
				}

				// If we are here, we basically have a response statusCode that we were npt expecting or are not set to handle
				// Go ahead and fall back to the catch-all
				this.handleUnhandledResponse(response, responseHandler);
			})
			.catch(error => {
				responseHandler.error(error);
			});
	}

}
