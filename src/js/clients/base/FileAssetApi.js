import ClientBaseClass from "./ClientBaseClass";
import DefaultClientOptions from "../DefaultClientOptions";

export default class FileAssetApi extends ClientBaseClass {
	/**
	 * This should never be called directly -- this is merely a placeholder so that the viewUrl in FileAsset will work correctly.
	 * @param {string} type
	 * @param {string} fileAssetIdentifier
	 * @param {string} filename
	 * @param {{status200: function(string), status404: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	get(type, fileAssetIdentifier, filename, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/file_asset/' +
			(type ? encodeURIComponent(type) : '') + '/' +
			(fileAssetIdentifier ? encodeURIComponent(fileAssetIdentifier) : '') + '/' +
			(filename ? encodeURIComponent(filename) : '');

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
						response.text()
							.then(responseText => {
								responseHandler.status200(responseText);
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
	 * This should never be called directly -- this is merely a placeholder so that the downloadUrl in FileAsset will work correctly.
	 * @param {string} type
	 * @param {string} fileAssetIdentifier
	 * @param {string} filename
	 * @param {{status200: function(string), status404: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	download(type, fileAssetIdentifier, filename, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/file_asset/download/' +
			(type ? encodeURIComponent(type) : '') + '/' +
			(fileAssetIdentifier ? encodeURIComponent(fileAssetIdentifier) : '') + '/' +
			(filename ? encodeURIComponent(filename) : '');

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
						response.text()
							.then(responseText => {
								responseHandler.status200(responseText);
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
