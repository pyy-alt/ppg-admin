import { useMemo } from 'react'
import { useLocation } from '@tanstack/react-router'

// 我们可以定义一个包含所有可能目录的对象
// 这样在 glob 中就可以包含所有路径
const ALL_IMAGE_GLOB = {
  // 包含 login 目录下的所有 .png
  login: import.meta.glob('@/assets/img/login/*.png', { eager: true }),
  // 包含 registration 目录下的所有 .png
  registration: import.meta.glob('@/assets/img/registration/*.png', {
    eager: true,
  }),
}

/**
 * 动态加载品牌图片资源的自定义 Hook
 * @param {string} directory - 图片所在的子目录名 ('login' 或 'registration')
 * @param {string} suffix - 图片的后缀名，例如 '_a.png' 或 '_c.png'
 * @returns {string | null} 匹配的图片资源的 URL，如果未找到则返回 null
 */
const useBrandLogo = (directory: string, suffix: string): string | null => {
  const location = useLocation()

  return useMemo(() => {
    // 1. 校验目录参数
    if (!ALL_IMAGE_GLOB[directory as keyof typeof ALL_IMAGE_GLOB]) {
      // eslint-disable-next-line no-console
      console.error(
        `[useBrandLogo] Invalid directory: ${directory}. Must be 'login' or 'registration'.`
      )
      return null
    }

    // 2. 优先从 URL 查询参数读取品牌前缀，如果没有则使用环境变量
    const searchParams = new URLSearchParams(location.search as string)
    const brandFromUrl = searchParams.get('brand')
    const BRAND_PREFIX =
      brandFromUrl || import.meta.env.VITE_BRAND_PREFIX || 'audi'

    // 3. 构建目标文件名：例如 audi_a.png 或 vw_c.png（不包含路径前缀）
    const TARGET_FILENAME = `${BRAND_PREFIX}${suffix}`

    // 4. 获取对应目录的图片模块
    const imageModules =
      ALL_IMAGE_GLOB[directory as keyof typeof ALL_IMAGE_GLOB]

    // 5. 遍历导入的模块，查找匹配项
    for (const path in imageModules) {
      // path 示例: '/src/assets/img/login/audi_a.png'
      // 检查路径是否包含目标文件名
      if (path.includes(TARGET_FILENAME)) {
        // 修复: imageModules[path] 的类型为 unknown，需要断言为 { default: string }
        const mod = imageModules[path] as { default: string }
        return mod.default
      }
    }

    // 6. 如果未找到，返回 null
    // eslint-disable-next-line no-console
    console.warn(
      `[useBrandLogo] Image not found for: ${TARGET_FILENAME} in ${directory} directory.`
    )
    return null
  }, [directory, suffix, location.href]) // 使用 location.href 作为依赖，当 URL 变化时重新计算
}

export default useBrandLogo
