import ClientBaseClass from './ClientBaseClass';
import ClientOptions from './ClientOptions';
import RepairOrderSearchResponse from '../../models/RepairOrderSearchResponse';
import RepairOrder from '../../models/RepairOrder';
import PartsOrderSearchResponse from '../../models/PartsOrderSearchResponse';
import PartsOrder from '../../models/PartsOrder';
import RepairOrderSearchRequest from '../../models/RepairOrderSearchRequest';
import PartsOrderSearchRequest from '../../models/PartsOrderSearchRequest';
import RepairOrderCreateRequest from '../../models/RepairOrderCreateRequest';
import PartsOrderWorkflowActionRequest from '../../models/PartsOrderWorkflowActionRequest';

export default class OrderApi extends ClientBaseClass {
  /**
   * Searches for repair orders.  For Shop users, only returns their shop's ROs.
   * @param request 
   * @param responseHandler 
   * @param options optional overrides on the DefaultClientOptions
   */
  repairOrderSearch(
    request: RepairOrderSearchRequest,
    responseHandler: {
      status200?: (response: RepairOrderSearchResponse) => void,
      status403?: (response: string) => void,
      error?: (error: any) => void,
      else?: (statusCode: number, responseText: string) => void
    },
    options?: ClientOptions | null
  ): void;

  /**
   * Gets a Repair Order record with all associated file assets
   * @param id 
   * @param responseHandler 
   * @param options optional overrides on the DefaultClientOptions
   */
  repairOrderGet(
    id: string,
    responseHandler: {
      status200?: (response: RepairOrder) => void,
      status403?: (response: string) => void,
      status404?: (response: string) => void,
      error?: (error: any) => void,
      else?: (statusCode: number, responseText: string) => void
    },
    options?: ClientOptions | null
  ): void;

  /**
   * [Shop] Saves (update) an existing Repair Order.  Id is required.  For Shop users only, and shopId must match their shop.  dealershipId is required.
   * @param request 
   * @param responseHandler 
   * @param options optional overrides on the DefaultClientOptions
   */
  repairOrderSave(
    request: RepairOrder,
    responseHandler: {
      status200?: (response: RepairOrder) => void,
      status403?: (response: string) => void,
      status404?: (response: string) => void,
      status409?: (response: string) => void,
      error?: (error: any) => void,
      else?: (statusCode: number, responseText: string) => void
    },
    options?: ClientOptions | null
  ): void;

  /**
   * [Shop] Saves (creates) an NEW Repair Order. Id must be NULL. shopId must match user's shop. dealershipId is required.
   * @param request 
   * @param responseHandler 
   * @param options optional overrides on the DefaultClientOptions
   */
  repairOrderCreate(
    request: RepairOrderCreateRequest,
    responseHandler: {
      status200?: (response: RepairOrder) => void,
      status403?: (response: string) => void,
      status404?: (response: string) => void,
      status409?: (response: string) => void,
      error?: (error: any) => void,
      else?: (statusCode: number, responseText: string) => void
    },
    options?: ClientOptions | null
  ): void;

  /**
   * [Shop] Marks a Repair Order as complete/closed.  Only Shop users can complete their own ROs.  .id and .postRepairPhotoFileAssets are required.  All other fields are ignored.
   * @param request 
   * @param responseHandler 
   * @param options optional overrides on the DefaultClientOptions
   */
  repairOrderComplete(
    request: RepairOrder,
    responseHandler: {
      status200?: (response: string) => void,
      status403?: (response: string) => void,
      status404?: (response: string) => void,
      status409?: (response: string) => void,
      error?: (error: any) => void,
      else?: (statusCode: number, responseText: string) => void
    },
    options?: ClientOptions | null
  ): void;

  /**
   * Searches for parts orders.  For Shop users, only returns parts orders for their shop.  For Dealership users, only returns parts orders for their dealership.  For CSR/Field Staff/Program Administrator, can search across all.
   * @param request 
   * @param responseHandler 
   * @param options optional overrides on the DefaultClientOptions
   */
  partsOrderSearch(
    request: PartsOrderSearchRequest,
    responseHandler: {
      status200?: (response: PartsOrderSearchResponse) => void,
      status403?: (response: string) => void,
      error?: (error: any) => void,
      else?: (statusCode: number, responseText: string) => void
    },
    options?: ClientOptions | null
  ): void;

  /**
   * Gets a Parts Order record with full details including activity log and file assets
   * @param id 
   * @param responseHandler 
   * @param options optional overrides on the DefaultClientOptions
   */
  partsOrderGet(
    id: string,
    responseHandler: {
      status200?: (response: PartsOrder) => void,
      status403?: (response: string) => void,
      status404?: (response: string) => void,
      error?: (error: any) => void,
      else?: (statusCode: number, responseText: string) => void
    },
    options?: ClientOptions | null
  ): void;

  /**
   * Gets all Parts Orders for a given Repair Order with full details including activity logs and file assets
   * @param repairOrderId 
   * @param responseHandler 
   * @param options optional overrides on the DefaultClientOptions
   */
  partsOrderGetAllForRepairOrder(
    repairOrderId: string,
    responseHandler: {
      status200?: (response: PartsOrder[]) => void,
      status403?: (response: string) => void,
      status404?: (response: string) => void,
      error?: (error: any) => void,
      else?: (statusCode: number, responseText: string) => void
    },
    options?: ClientOptions | null
  ): void;

  /**
   * [Shop, Csr, FieldStaff, ProgramAdministrator] Saves (create or update) a Parts Order.  Set id to update, leave id null to create.  Creating is only allowed for Shop users and must be for their shop's repair order.  Updating is allowed based on status of the parts order itself.
   * @param request 
   * @param responseHandler 
   * @param options optional overrides on the DefaultClientOptions
   */
  partsOrderSave(
    request: PartsOrder,
    responseHandler: {
      status200?: (response: PartsOrder) => void,
      status403?: (response: string) => void,
      status404?: (response: string) => void,
      status409?: (response: string) => void,
      error?: (error: any) => void,
      else?: (statusCode: number, responseText: string) => void
    },
    options?: ClientOptions | null
  ): void;

  /**
   * Advances a Parts Order through its workflow status, performing status-specific actions (approve/reject, resubmit, ship/unship, receive/unreceive).  Creates activity log entries.
   * @param request 
   * @param responseHandler 
   * @param options optional overrides on the DefaultClientOptions
   */
  partsOrderSubmitWorkflowAction(
    request: PartsOrderWorkflowActionRequest,
    responseHandler: {
      status200?: (response: PartsOrder) => void,
      status403?: (response: string) => void,
      status404?: (response: string) => void,
      status409?: (response: string) => void,
      error?: (error: any) => void,
      else?: (statusCode: number, responseText: string) => void
    },
    options?: ClientOptions | null
  ): void;
}