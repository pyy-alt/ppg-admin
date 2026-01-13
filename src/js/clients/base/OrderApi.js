import ClientBaseClass from "./ClientBaseClass";
import DefaultClientOptions from "../DefaultClientOptions";
import RepairOrderSearchResponse from "../../models/RepairOrderSearchResponse";
import RepairOrder from "../../models/RepairOrder";
import PartsOrderSearchResponse from "../../models/PartsOrderSearchResponse";
import PartsOrder from "../../models/PartsOrder";

export default class OrderApi extends ClientBaseClass {
	/**
	 * Searches for repair orders.  For Shop users, only returns their shop's ROs.
	 * @param {RepairOrderSearchRequest} request
	 * @param {{status200: function(RepairOrderSearchResponse), status403: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	repairOrderSearch(request, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/order/repair_order/search';

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
								responseHandler.status200(RepairOrderSearchResponse.create(responseJson));
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
	 * Gets a Repair Order record with all associated file assets
	 * @param {string} id
	 * @param {{status200: function(RepairOrder), status403: function(string), status404: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	repairOrderGet(id, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/order/repair_order/get/' +
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
								responseHandler.status200(RepairOrder.create(responseJson));
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
	 * [Shop] Saves (update) an existing Repair Order.  Id is required.  For Shop users only, and shopId must match their shop.  dealershipId is required.
	 * @param {RepairOrder} request
	 * @param {{status200: function(RepairOrder), status403: function(string), status404: function(string), status409: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	repairOrderSave(request, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/order/repair_order/save';

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
								responseHandler.status200(RepairOrder.create(responseJson));
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
	 * [Shop] Saves (creates) an NEW Repair Order. Id must be NULL. shopId must match user's shop. dealershipId is required.
	 * @param {RepairOrderCreateRequest} request
	 * @param {{status200: function(RepairOrder), status403: function(string), status404: function(string), status409: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	repairOrderCreate(request, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/order/repair_order/create';

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
								responseHandler.status200(RepairOrder.create(responseJson));
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
	 * [Shop] Marks a Repair Order as complete/closed.  Only Shop users can complete their own ROs.  .id and .postRepairPhotoFileAssets are required.  All other fields are ignored.
	 * @param {RepairOrder} request
	 * @param {{status200: function(string), status403: function(string), status404: function(string), status409: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	repairOrderComplete(request, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/order/repair_order/complete';

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
	 * Searches for parts orders.  For Shop users, only returns parts orders for their shop.  For Dealership users, only returns parts orders for their dealership.  For Program Administrator, can search across all.  For CSR/Field Staff, it will be filtered to just region(s) they have access to.
	 * @param {PartsOrderSearchRequest} request
	 * @param {{status200: function(PartsOrderSearchResponse), status403: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	partsOrderSearch(request, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/order/parts_order/search';

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
								responseHandler.status200(PartsOrderSearchResponse.create(responseJson));
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
	 * Gets a Parts Order record with full details including activity log and file assets
	 * @param {string} id
	 * @param {{status200: function(PartsOrder), status403: function(string), status404: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	partsOrderGet(id, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/order/parts_order/get/' +
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
								responseHandler.status200(PartsOrder.create(responseJson));
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
	 * Gets all Parts Orders for a given Repair Order with full details including activity logs and file assets
	 * @param {string} repairOrderId
	 * @param {{status200: function(PartsOrder[]), status403: function(string), status404: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	partsOrderGetAllForRepairOrder(repairOrderId, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/order/parts_order/get_all/' +
			(repairOrderId ? encodeURIComponent(repairOrderId) : '');

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
								responseHandler.status200(PartsOrder.createArray(responseJson));
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
	 * [Shop, Csr, FieldStaff, ProgramAdministrator] Saves (create or update) a Parts Order.  Set id to update, leave id null to create.  Creating is only allowed for Shop users and must be for their shop's repair order.  Updating is allowed based on status of the parts order itself.
	 * @param {PartsOrder} request
	 * @param {{status200: function(PartsOrder), status403: function(string), status404: function(string), status409: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	partsOrderSave(request, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/order/parts_order/save';

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
								responseHandler.status200(PartsOrder.create(responseJson));
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
	 * Advances a Parts Order through its workflow status, performing status-specific actions (approve/reject, resubmit, ship/unship, receive/unreceive).  Creates activity log entries.
	 * @param {PartsOrderWorkflowActionRequest} request
	 * @param {{status200: function(PartsOrder), status403: function(string), status404: function(string), status409: function(string), error: function(error), else: function(integer, string)}} responseHandler
	 * @param {ClientOptions|null} options optional overrides on the DefaultClientOptions
	 */
	partsOrderSubmitWorkflowAction(request, responseHandler, options) {
		responseHandler = this.generateResponseHandler(responseHandler, options);

		const url = '/order/parts_order/workflow_action';

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
								responseHandler.status200(PartsOrder.create(responseJson));
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

}
