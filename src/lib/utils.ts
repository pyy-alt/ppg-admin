import  { type FileAssetType } from '@/js/models/enum/FileAssetFileAssetTypeEnum'
import FileAsset from '@/js/models/FileAsset'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// 添加工具函数：将 File 转换为 base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      // 移除 data:image/png;base64, 或 data:application/pdf;base64, 前缀
      const base64String = (reader.result as string).split(',')[1]
      resolve(base64String)
    }
    reader.onerror = (error) => reject(error)
  })
}
// 添加工具函数：将 File[] 转换为 FileAsset[]
export const convertFilesToFileAssets = async (
  files: File[],
  fileAssetType: FileAssetType
): Promise<any[]> => {
  if (!files || files.length === 0) {
    return []
  }

  const fileAssets = await Promise.all(
    files.map(async (file) => {
      const base64Data = await fileToBase64(file)
      return FileAsset.create({
        fileAssetType: fileAssetType,
        uploadBase64Data: base64Data,
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type,
      })
    })
  )

  return fileAssets
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generates page numbers for pagination with ellipsis
 * @param currentPage - Current page number (1-based)
 * @param totalPages - Total number of pages
 * @returns Array of page numbers and ellipsis strings
 *
 * Examples:
 * - Small dataset (≤5 pages): [1, 2, 3, 4, 5]
 * - Near beginning: [1, 2, 3, 4, '...', 10]
 * - In middle: [1, '...', 4, 5, 6, '...', 10]
 * - Near end: [1, '...', 7, 8, 9, 10]
 */
export function getPageNumbers(currentPage: number, totalPages: number) {
  const maxVisiblePages = 5 // Maximum number of page buttons to show
  const rangeWithDots = []

  if (totalPages <= maxVisiblePages) {
    // If total pages is 5 or less, show all pages
    for (let i = 1; i <= totalPages; i++) {
      rangeWithDots.push(i)
    }
  } else {
    // Always show first page
    rangeWithDots.push(1)

    if (currentPage <= 3) {
      // Near the beginning: [1] [2] [3] [4] ... [10]
      for (let i = 2; i <= 4; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    } else if (currentPage >= totalPages - 2) {
      // Near the end: [1] ... [7] [8] [9] [10]
      rangeWithDots.push('...')
      for (let i = totalPages - 3; i <= totalPages; i++) {
        rangeWithDots.push(i)
      }
    } else {
      // In the middle: [1] ... [4] [5] [6] ... [10]
      rangeWithDots.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    }
  }

  return rangeWithDots
}

// 根据预设范围计算日期  // 根据预设范围计算日期
export const calculateDateRange = (preset: string) => {
  const today = new Date()
  // 获取今天的本地日期（年月日）
  const todayYear = today.getFullYear()
  const todayMonth = today.getMonth()
  const todayDate = today.getDate()

  // 创建只包含年月日的日期对象（时间设为 00:00:00，使用本地时区）
  const createDateOnly = (year: number, month: number, date: number) => {
    return new Date(year, month, date, 0, 0, 0, 0)
  }

  // 创建结束日期（时间设为 23:59:59.999，使用本地时区）
  const createEndDate = (year: number, month: number, date: number) => {
    return new Date(year, month, date, 23, 59, 59, 999)
  }

  switch (preset) {
    case '7': {
      const fromDate = new Date(todayYear, todayMonth, todayDate - 7)
      return {
        from: createDateOnly(
          fromDate.getFullYear(),
          fromDate.getMonth(),
          fromDate.getDate()
        ),
        to: createEndDate(todayYear, todayMonth, todayDate),
      }
    }
    case '30': {
      const fromDate = new Date(todayYear, todayMonth, todayDate - 30)
      return {
        from: createDateOnly(
          fromDate.getFullYear(),
          fromDate.getMonth(),
          fromDate.getDate()
        ),
        to: createEndDate(todayYear, todayMonth, todayDate),
      }
    }
    case 'month-to-date':
      return {
        from: createDateOnly(todayYear, todayMonth, 1),
        to: createEndDate(todayYear, todayMonth, todayDate),
      }
    case 'quarter-to-date': {
      const quarter = Math.floor(todayMonth / 3)
      return {
        from: createDateOnly(todayYear, quarter * 3, 1),
        to: createEndDate(todayYear, todayMonth, todayDate),
      }
    }
    case 'year-to-date':
      return {
        from: createDateOnly(todayYear, 0, 1),
        to: createEndDate(todayYear, todayMonth, todayDate),
      }
    case 'last-month': {
      const lastMonth = todayMonth === 0 ? 11 : todayMonth - 1
      const lastMonthYear = todayMonth === 0 ? todayYear - 1 : todayYear
      // 获取上个月的最后一天
      const lastDayOfLastMonth = new Date(todayYear, todayMonth, 0).getDate()
      return {
        from: createDateOnly(lastMonthYear, lastMonth, 1),
        to: createEndDate(lastMonthYear, lastMonth, lastDayOfLastMonth),
      }
    }
    case 'last-quarter': {
      const lastQuarter = Math.floor(todayMonth / 3) - 1
      const lastQuarterMonth = lastQuarter < 0 ? 9 : lastQuarter * 3 // 如果上季度是去年，则是 9 月（Q4）
      const lastQuarterYear = lastQuarter < 0 ? todayYear - 1 : todayYear
      // 获取上季度的最后一天
      const lastDayOfLastQuarter = new Date(
        lastQuarterYear,
        (lastQuarter + 1) * 3,
        0
      ).getDate()
      const lastQuarterEndMonth =
        lastQuarter < 0 ? 11 : (lastQuarter + 1) * 3 - 1
      return {
        from: createDateOnly(lastQuarterYear, lastQuarterMonth, 1),
        to: createEndDate(
          lastQuarterYear,
          lastQuarterEndMonth,
          lastDayOfLastQuarter
        ),
      }
    }
    case 'last-year':
      return {
        from: createDateOnly(todayYear - 1, 0, 1),
        to: createEndDate(todayYear - 1, 11, 31),
      }
    case 'custom':
      return { from: undefined, to: undefined }
    default:
      return { from: undefined, to: undefined }
  }
}
// 格式化日期为 YYYY-MM-DD 字符串（date only）
export const formatDateOnly = (date: Date | undefined): string | undefined => {
  if (!date) return undefined
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
