import ClientBaseClass from "./ClientBaseClass";
import DefaultClientOptions from "../DefaultClientOptions";
import OrganizationSearchResponse from "../../models/OrganizationSearchResponse";
import Organization from "../../models/Organization";

export default class OrganizationApi extends ClientBaseClass {
	/**
	 * Searches for organizations in the system
	 * @param {OrganizationSearchRequest} request
	 * @param {{status200: function(OrganizationSearchResponse), status403: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	search(request, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/organization/search';

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
								responseHandler.status200(OrganizationSearchResponse.create(responseJson));
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
	 * Gets a Shop organization record
	 * @param {string} id
	 * @param {{status200: function(Organization), status403: function(string), status404: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	shopGet(id, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/organization/shop/get/' +
			(id ? encodeURIComponent(id) : '');

		// noinspection Duplicates
		this.executeApiCall(url, 'get', null, null, options)
			.then(response => {
				if (options) {
					if (options.onApiProcessResponse) options.onApiProcessResponse(url, 'get', response);
				} else if (DefaultClientOptions.onApiProcessResponse) {
					DefaultClientOptions.onApiProcessResponse(url, 'get', response);
				}

				switch (response.status) {
				case 200:
					if (responseHandler.status200) {
						response.json()
							.then(responseJson => {
								responseHandler.status200(Organization.create(responseJson));
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

	/**
	 * Gets a Dealership organization record
	 * @param {string} id
	 * @param {{status200: function(Organization), status403: function(string), status404: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	dealershipGet(id, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/organization/dealership/get/' +
			(id ? encodeURIComponent(id) : '');

		// noinspection Duplicates
		this.executeApiCall(url, 'get', null, null, options)
			.then(response => {
				if (options) {
					if (options.onApiProcessResponse) options.onApiProcessResponse(url, 'get', response);
				} else if (DefaultClientOptions.onApiProcessResponse) {
					DefaultClientOptions.onApiProcessResponse(url, 'get', response);
				}

				switch (response.status) {
				case 200:
					if (responseHandler.status200) {
						response.json()
							.then(responseJson => {
								responseHandler.status200(Organization.create(responseJson));
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
