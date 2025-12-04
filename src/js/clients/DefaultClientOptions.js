import { toast } from 'sonner'
import { useLoadingStore } from '@/stores/loading-store'  
/**
 * This is the default client options / middleware for ALL client API webservice calls.
 * This file is designed to be altered.
 * It can also be overridden per-request by passing in a ClientOptions object into any API call.
 */
export default class DefaultClientOptions {
  // 添加防重复处理的缓存（URL -> 时间戳）
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
      credentials: 'include', // 必须使用 'include' 才能在跨域请求时携带 Cookie
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
        // ✅ 每次开始请求时 +1
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
    // ✅ 收到响应时 -1
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
      // 统一处理所有非 200 状态码
      if (response.status !== 200) {
        // 克隆 response 以便读取 body（因为 response 只能读取一次）
        const clonedResponse = response.clone()

        // 异步读取错误消息
        clonedResponse
          .text()
          .then((text) => {
            let errorMessage = ''
            try {
              // 尝试解析 JSON 格式的错误消息
              const data = JSON.parse(text)
              errorMessage =
                data.message ||
                data.error ||
                text ||
                `HTTP ${response.status} Error`
            } catch {
              // 如果不是 JSON，直接使用文本
              errorMessage = text || `HTTP ${response.status} Error`
            }

            // 根据状态码显示不同的错误提示
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
                // 只对特定接口的 404 错误进行处理
                // 动态导入以避免循环依赖
                import('@/lib/api-404-config').then(
                  ({ shouldRedirectToLoginOn404 }) => {
                    // 检查是否是需要跳转登录的接口
                    if (shouldRedirectToLoginOn404(url)) {
                      // 检查当前路径是否是未认证路由（如 /login），如果是就不跳转（避免循环）
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

                      // 如果在未认证路由页面，不跳转（因为这是正常情况，避免循环刷新）
                      if (isUnauthenticatedRoute) {
                        return
                      }

                      // 如果不在未认证路由列表中，说明是受保护路由
                      // 父路由已经处理了未认证情况，会显示 WelcomeGate，不需要跳转到登录页
                      // 直接 return，不执行跳转
                      return

                      const now = Date.now()
                      const lastHandled =
                        DefaultClientOptions._404HandledUrls.get(url)

                      // 如果这个 URL 在 3 秒内已经处理过，跳过（防止重复跳转）
                      if (lastHandled && now - lastHandled < 3000) {
                        return
                      }

                      // 标记为已处理
                      DefaultClientOptions._404HandledUrls.set(url, now)

                      // 3 秒后清除标记，允许重新处理
                      setTimeout(() => {
                        DefaultClientOptions._404HandledUrls.delete(url)
                      }, 3000)

                      // TODO: 暂时注释掉对话框，直接跳转登录页
                      // 如果需要恢复对话框功能，取消下面的注释，并注释掉下面的直接跳转代码
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

                      // 直接跳转到登录页
                      import('@/stores/auth-store').then(({ useAuthStore }) => {
                        useAuthStore.getState().auth.reset()
                        const redirect = window.location.href
                        window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`
                      })
                    }
                  }
                )
                //   // 动态导入以避免循环依赖
                //   import('@/stores/global-404-store').then(({ useGlobal404Store }) => {
                //     import('@/lib/api-404-config').then(
                //       ({ shouldRedirectToLoginOn404 }) => {
                //         // 检查是否是需要跳转登录的接口
                //         if (shouldRedirectToLoginOn404(url)) {
                //           // 检查当前路径是否是未认证路由（如 /login），如果是就不显示弹窗
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

                //           // 如果在未认证路由页面，不显示弹窗（因为这是正常情况）
                //           if (isUnauthenticatedRoute) {
                //             return
                //           }

                //           const now = Date.now()
                //           const lastHandled = DefaultClientOptions._404HandledUrls.get(url)

                //           // 如果这个 URL 在 3 秒内已经处理过，跳过
                //           if (lastHandled && now - lastHandled < 3000) {
                //             return
                //           }

                //           // 标记为已处理
                //           DefaultClientOptions._404HandledUrls.set(url, now)

                //           // 3 秒后清除标记，允许重新处理
                //           setTimeout(() => {
                //             DefaultClientOptions._404HandledUrls.delete(url)
                //           }, 3000)

                //           const store = useGlobal404Store.getState()
                //           // 如果已经打开，不重复打开
                //           if (store.isOpen) {
                //             return
                //           }

                //           // 立即打开 dialog，不等待 response.text() 解析
                //           store.open(undefined, url)

                //           // 然后异步获取错误消息（如果有）并更新
                //           const clonedResponse = response.clone()
                //           clonedResponse
                //             .text()
                //             .then((text) => {
                //               try {
                //                 const data = JSON.parse(text)
                //                 const message = data.message || data.error || null
                //                 if (message) {
                //                   // 只更新消息，不重复打开
                //                   store.open(message, url)
                //                 }
                //               } catch {
                //                 // 如果不是 JSON，使用默认消息（已经打开了）
                //               }
                //             })
                //             .catch(() => {
                //               // 忽略错误，使用默认消息（已经打开了）
                //             })
                //         }
                //         // 如果不是白名单中的接口，404 错误会正常传递给 handler 处理
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
            // 如果读取失败，显示默认错误
            toast.error(`HTTP ${response.status} Error`)
          })

        // 注意：这里不 return，让 API 方法继续处理，以便 status200 能正常工作
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
         // ✅ 出错时也要 -1（防止永远卡 loading）
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
