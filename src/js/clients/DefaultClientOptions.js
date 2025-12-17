import { toast } from 'sonner'
import { useLoadingStore } from '@/stores/loading-store'  
/**
 * This is the default client options / middleware for ALL client API webservice calls.
 * This file is designed to be altered.
 * It can also be overridden per-request by passing in a ClientOptions object into any API call.
 */
export default class DefaultClientOptions {
  // Add cache to prevent duplicate processing（URL -> Timestamp）
  static _404HandledUrls = new Map()

  /**
   * The root Endpoint URL for all webservice method calls in this Client.
   * This is designed to be altered.
   * @return {string}
   */
  static getEndpointUrl() {
    return 'https://audi-api.ppg.dev.quasidea.com'
  }

  /**
   * The default/initial requestOptions to be sent to any fetch() call.
   * This is designed to be altered.
   * @param {string} method
   * @return {object}
   */
  static generateRequestOptionsForMethod(method) {
    const requestOptions = {
      method: method,
      credentials: 'include', // Must be used 'include' to carry during cross-origin requests Cookie
      headers: new Headers(),
    }

    return requestOptions
  }

  /**
   * This method is called on EVERY API call.
   * Feel free to modify, or you can remove this method altogether if an onApiCall handler is not needed.
   *
   * @method onApiCall
   * @param {string} url
   * @param {string} method
   * @param [request]
   * @param {string} [requestType]
   */

  static onApiCall(url, method, request, requestType) {
    console.log('[API Call] ' + method.toUpperCase() + ' ' + url)
        // ✅ At the start of each request +1
        try {
          useLoadingStore.getState().start()
        } catch {}
  }

  /**
   * This method is called on EVERY API response.
   * Feel free to modify, or you can remove this method altogether if an onApiResponse handler is not needed.
   *
   * @method onApiResponse
   * @param {string} url
   * @param {string} method
   * @param [request]
   * @param {string} [requestType]
   */

  static onApiResponse(url, method, request, requestType) {
    console.log('[API Response] ' + method.toUpperCase() + ' ' + url)
    // ✅ When receiving a response -1
    try {
      useLoadingStore.getState().end()
    } catch {}
  }

  /**
   * This method is called whenever a response is being processed by the handler.
   * Feel free to modify, or you can remove this method altogether if an onApiProcessResponse handler is not needed.
   *
   * @method onApiProcessResponse
   * @param {string} url
   * @param {string} method
   * @param {Response} response
   */

  static onApiProcessResponse(url, method, response) {
    try {
      // Uniformly handle all non 200 status codes
      if (response.status !== 200) {
        // Clone response to read body（Because response can only be read once）
        const clonedResponse = response.clone()

        // Asynchronous read error message
        clonedResponse
          .text()
          .then((text) => {
            let errorMessage = ''
            try {
              // Try to parse JSON formatted error message
              const data = JSON.parse(text)
              errorMessage =
                data.message ||
                data.error ||
                text ||
                `HTTP ${response.status} Error`
            } catch {
              // If not JSON，Directly use the text
              errorMessage = text || `HTTP ${response.status} Error`
            }

            // Display different error prompts based on status codes
            switch (response.status) {
              case 400:
                toast.error(errorMessage || 'Bad Request')
                break
              case 401:
                toast.error(errorMessage || 'Unauthorized')
                break
              case 403:
                toast.error(errorMessage || 'Forbidden')
                break
              case 404:
                // Only handle errors for specific interfaces 404 Error handling
                // Dynamically import to avoid circular dependencies
                import('@/lib/api-404-config').then(
                  ({ shouldRedirectToLoginOn404 }) => {
                    // Check if it is an interface that requires login redirection
                    if (shouldRedirectToLoginOn404(url)) {
                      // Check if the current path is an unauthenticated route（For example /login），If so, do not redirect（Avoid loops）
                      const currentPath = window.location.pathname
                      const unauthenticatedRoutes = [
                        '/login',
                        '/password/forgot',
                        '/password/reset',
                        '/registration/shop',
                        '/registration/dealership',
                        '/registration/complete',
                        '/registrationResult',
                      ]

                      const isUnauthenticatedRoute = unauthenticatedRoutes.some(
                        (route) =>
                          currentPath === route ||
                          currentPath.startsWith(route + '/')
                      )

                      // If on an unauthenticated route page，Do not redirect（Because this is a normal situation，Avoid refreshing loops）
                      if (isUnauthenticatedRoute) {
                        return
                      }

                      // If not in the unauthenticated route list，It indicates a protected route
                      // The parent route has handled the unauthenticated situation，Will display WelcomeGate，No need to redirect to the login page
                      // Directly return，Do not execute redirection
                      return

                      const now = Date.now()
                      const lastHandled =
                        DefaultClientOptions._404HandledUrls.get(url)

                      // If this URL within 3 seconds has been processed，Skip（Prevent duplicate redirection）
                      if (lastHandled && now - lastHandled < 3000) {
                        return
                      }

                      // Mark as processed
                      DefaultClientOptions._404HandledUrls.set(url, now)

                      // 3 Clear the mark after seconds，Allow reprocessing
                      setTimeout(() => {
                        DefaultClientOptions._404HandledUrls.delete(url)
                      }, 3000)

                      // TODO: Temporarily comment out the dialog，Directly redirect to the login page
                      // If you need to restore the dialog functionality，Uncomment below，And comment out the direct redirection code below
                      // import('@/stores/global-404-store').then(({ useGlobal404Store }) => {
                      //   const store = useGlobal404Store.getState()
                      //   if (store.isOpen) {
                      //     return
                      //   }
                      //   store.open(undefined, url)
                      //   const clonedResponse = response.clone()
                      //   clonedResponse
                      //     .text()
                      //     .then((text) => {
                      //       try {
                      //         const data = JSON.parse(text)
                      //         const message = data.message || data.error || null
                      //         if (message) {
                      //           store.open(message, url)
                      //         }
                      //       } catch {}
                      //     })
                      //     .catch(() => {})
                      // })

                      // Directly redirect to the login page
                      import('@/stores/auth-store').then(({ useAuthStore }) => {
                        useAuthStore.getState().auth.reset()
                        const redirect = window.location.href
                        window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`
                      })
                    }
                  }
                )
                //   // Dynamically import to avoid circular dependencies
                //   import('@/stores/global-404-store').then(({ useGlobal404Store }) => {
                //     import('@/lib/api-404-config').then(
                //       ({ shouldRedirectToLoginOn404 }) => {
                //         // Check if it is an interface that requires login redirection
                //         if (shouldRedirectToLoginOn404(url)) {
                //           // Check if the current path is an unauthenticated route（For example /login），If so, do not display the popup
                //           const currentPath = window.location.pathname
                //           const unauthenticatedRoutes = [
                //             '/login',
                //             '/password/forgot',
                //             '/password/reset',
                //             '/registration/shop',
                //             '/registration/dealership',
                //             '/registration/complete',
                //             '/registrationResult',
                //           ]

                //           const isUnauthenticatedRoute = unauthenticatedRoutes.some(
                //             (route) =>
                //               currentPath === route || currentPath.startsWith(route + '/')
                //           )

                //           // If on an unauthenticated route page，Do not display the popup（Because this is a normal situation）
                //           if (isUnauthenticatedRoute) {
                //             return
                //           }

                //           const now = Date.now()
                //           const lastHandled = DefaultClientOptions._404HandledUrls.get(url)

                //           // If this URL within 3 seconds has been processed，Skip
                //           if (lastHandled && now - lastHandled < 3000) {
                //             return
                //           }

                //           // Mark as processed
                //           DefaultClientOptions._404HandledUrls.set(url, now)

                //           // 3 Clear the mark after seconds，Allow reprocessing
                //           setTimeout(() => {
                //             DefaultClientOptions._404HandledUrls.delete(url)
                //           }, 3000)

                //           const store = useGlobal404Store.getState()
                //           // If already opened，Do not reopen
                //           if (store.isOpen) {
                //             return
                //           }

                //           // Open immediately dialog，Do not wait response.text() Parse
                //           store.open(undefined, url)

                //           // Then asynchronously get the error message（If there is）And update
                //           const clonedResponse = response.clone()
                //           clonedResponse
                //             .text()
                //             .then((text) => {
                //               try {
                //                 const data = JSON.parse(text)
                //                 const message = data.message || data.error || null
                //                 if (message) {
                //                   // Only update the message，Do not reopen
                //                   store.open(message, url)
                //                 }
                //               } catch {
                //                 // If not JSON，Use the default message（Has been opened）
                //               }
                //             })
                //             .catch(() => {
                //               // Ignore error，Use the default message（Has been opened）
                //             })
                //         }
                //         // If not an interface in the whitelist，404 Errors will be normally passed to handler Handle
                //       }
                //     )
                //   })
                break
              case 409:
                toast.warning(errorMessage || 'Conflict', {
                  position: 'top-right',
                })
                break
              case 500:
                toast.error(errorMessage || 'Internal Server Error', {
                  position: 'top-right',
                })
                break
              default:
                toast.error(errorMessage || `HTTP ${response.status} Error`)
            }
          })
          .catch(() => {
            // If reading fails，Display default error
            toast.error(`HTTP ${response.status} Error`)
          })

        // Note：Here does not return，Let API the method continue processing，So that status200 can work normally
      }
    } catch (error) {}
  }

  /**
   * The default/initial set of response handlers for the response to any fetch() call.
   * This is designed to be altered.
   * @return {object}
   */
  static generateDefaultResponseHandler() {
    const responseHandler = {
      error: (error) => {
        console.error(error)
         // ✅ Even when an error occurs -1（Prevent getting stuck forever loading）
         try {
          useLoadingStore.getState().end()
        } catch {}
      },
      else: (statusCode, responseText) => {
        console.warn(
          'Unhandled API Call response: HTTP Status Code [' +
            statusCode +
            ']: [' +
            responseText +
            ']'
        )
      },
    }

    return responseHandler
  }
}
