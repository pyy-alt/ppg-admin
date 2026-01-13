import ClientBaseClass from "./ClientBaseClass";
import DefaultClientOptions from "../DefaultClientOptions";
import Session from "../../models/Session";

export default class AuthenticationApi extends ClientBaseClass {
	/**
	 * Logs a user into the system
	 * @param {LoginRequest} request
	 * @param {{status200: function(Session), status404: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	login(request, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/authentication/login';

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
								responseHandler.status200(Session.create(responseJson));
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
	 * Logs a user out of the system
	 * @param {{status200: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	logout(responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/authentication/logout';

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
	 * Attempts to trigger a Forgot / Reset Password workflow.  IF the Email exists, this will send out an email with instructions on how to reset their password.  Otherwise, this is a no-op.  Either way, this responds 200, so that this cannot be used to try and reverse-engineer for email address registrations.
	 * @param {ForgotPasswordRequest} request
	 * @param {{status200: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	forgotPassword(request, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/authentication/forgot_password';

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
	 * Updates the user's password -- when calling within a session that was initiated by Registration or Forgot Password, currentPassword is ignored.  Otherwise, currentPassword is required.
	 * @param {UpdatePasswordRequest} request
	 * @param {{status200: function(string), status409: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	updatePassword(request, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/authentication/update_password';

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
	 * Creates and logs in a user session based on an emailed link (e.g. for password reset or registration confirmation)
	 * @param {string} id
	 * @param {string} guid
	 * @param {string} hash
	 * @param {{status200: function(Session), status404: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	sessionCreate(id, guid, hash, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/authentication/session/create/' +
			(id ? encodeURIComponent(id) : '') + '/' +
			(guid ? encodeURIComponent(guid) : '') + '/' +
			(hash ? encodeURIComponent(hash) : '');

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
								responseHandler.status200(Session.create(responseJson));
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
	 * Retrieves the current session for the logged in user, or will return 401 if no valid session
	 * @param {{status200: function(Session), status401: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	sessionGetCurrent(responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/authentication/session/current';

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
								responseHandler.status200(Session.create(responseJson));
							})
							.catch(responseHandler.error);
						return;
					}
					break;
				case 401:
					if (responseHandler.status401) {
						response.text()
							.then(responseText => {
								responseHandler.status401(responseText);
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
	 * Initiates a registration request for a new Shop user
	 * @param {RegistrationRequest} request
	 * @param {{status200: function(string), status409: function(string), status410: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	registrationRequestShop(request, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/authentication/registration/request/shop';

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
				case 410:
					if (responseHandler.status410) {
						response.text()
							.then(responseText => {
								responseHandler.status410(responseText);
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
	 * Initiates a registration request for a new Dealership user
	 * @param {RegistrationRequest} request
	 * @param {{status200: function(string), status409: function(string), status410: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	registrationRequestDealership(request, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/authentication/registration/request/dealership';

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
				case 410:
					if (responseHandler.status410) {
						response.text()
							.then(responseText => {
								responseHandler.status410(responseText);
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
	 * Completes an approved registration request by setting the user's password.  Must be called within a session created via AuthenticationApi::sessionCreate()
	 * @param {CompleteRegistrationRequest} request
	 * @param {{status200: function(Session), status409: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	registrationComplete(request, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/authentication/registration/complete';

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
								responseHandler.status200(Session.create(responseJson));
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
	 * Gets general info about the app installation
	 * @param {{status200: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	getInfo(responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/authentication/get_info';

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
