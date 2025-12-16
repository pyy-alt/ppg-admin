import FileAsset from '@/js/models/FileAsset'
import { type FileAssetType } from '@/js/models/enum/FileAssetFileAssetTypeEnum'
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
  const todayYear = today.getFullYear()
  const todayMonth = today.getMonth() // 0-11
  const todayDate = today.getDate()

  // 创建起始日期（00:00:00，本地时区）
  const createDateOnly = (year: number, month: number, date: number) => {
    return new Date(year, month, date, 0, 0, 0, 0)
  }

  // 创建结束日期（23:59:59.999，本地时区）
  const createEndDate = (year: number, month: number, date: number) => {
    return new Date(year, month, date, 23, 59, 59, 999)
  }

  switch (preset) {
    case '7': {
      // 包括今天在内的过去7天（共7天）
      const fromDate = new Date(todayYear, todayMonth, todayDate - 6)
      return {
        from: createDateOnly(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()),
        to: createEndDate(todayYear, todayMonth, todayDate),
      }
    }
    case '30': {
      // 包括今天在内的过去30天（共30天）
      const fromDate = new Date(todayYear, todayMonth, todayDate - 29)
      return {
        from: createDateOnly(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()),
        to: createEndDate(todayYear, todayMonth, todayDate),
      }
    }
    case 'month-to-date':
      return {
        from: createDateOnly(todayYear, todayMonth, 1),
        to: createEndDate(todayYear, todayMonth, todayDate),
      }
    case 'quarter-to-date': {
      const quarterStartMonth = Math.floor(todayMonth / 3) * 3 // 0, 3, 6, 9
      return {
        from: createDateOnly(todayYear, quarterStartMonth, 1),
        to: createEndDate(todayYear, todayMonth, todayDate),
      }
    }
    case 'year-to-date':
      return {
        from: createDateOnly(todayYear, 0, 1),
        to: createEndDate(todayYear, todayMonth, todayDate),
      }
    case 'last-month': {
      const lastMonthYear = todayMonth === 0 ? todayYear - 1 : todayYear
      const lastMonth = todayMonth === 0 ? 11 : todayMonth - 1
      const lastDayOfLastMonth = new Date(lastMonthYear, lastMonth + 1, 0).getDate()
      return {
        from: createDateOnly(lastMonthYear, lastMonth, 1),
        to: createEndDate(lastMonthYear, lastMonth, lastDayOfLastMonth),
      }
    }
    case 'last-quarter': {
      const currentQuarter = Math.floor(todayMonth / 3)
      const lastQuarterStartMonth = currentQuarter === 0 ? 9 : (currentQuarter - 1) * 3
      const lastQuarterYear = currentQuarter === 0 ? todayYear - 1 : todayYear
      const lastQuarterEndMonth = lastQuarterStartMonth + 2
      const lastDayOfLastQuarter = new Date(lastQuarterYear, lastQuarterEndMonth + 1, 0).getDate()
      return {
        from: createDateOnly(lastQuarterYear, lastQuarterStartMonth, 1),
        to: createEndDate(lastQuarterYear, lastQuarterEndMonth, lastDayOfLastQuarter),
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
/**
 * 格式化日期时间 → 02/31/2025 10:33:25 AM（美式月/日/年 + 12小时制 + AM/PM）
 * @param date Date | string | undefined | null
 * @param includeSeconds 是否显示秒（默认 true）
 * @returns string | undefined
 */
export const formatDateOnly = (
  date: Date | string | number | undefined | null,
  includeSeconds = true
): string | undefined => {
  if (!date) return undefined

  const d = new Date(date)

  // 判断日期是否有效
  if (isNaN(d.getTime())) return undefined

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0') // 月份从0开始
  const day = String(d.getDate()).padStart(2, '0')

  let hours = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours || 12 // 0点显示为12

  const timeStr = includeSeconds
    ? `${hours}:${minutes}:${seconds} ${ampm}`
    : `${hours}:${minutes} ${ampm}`

  return `${month}/${day}/${year} ${timeStr}`
}
export const exportCurrentPageToCSV = (
  data: any[],
  headers: string[],
  filename: string = 'Parts_Order'
) => {
  if (data.length === 0) {
    alert('没有数据可导出')
    return
  }
  try {
    return new Promise((resolve) => {
      // 转义函数（防止逗号、换行、引号破坏 CSV）
      const escape = (val: any) => {
        if (val === null || val === undefined) return ''
        const str = String(val).trim()
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      }

      // 自动根据 headers 的顺序取数据（key 必须和对象属性一致）
      const rows = data.map((row) =>
        headers.map((header) => escape(row[header] ?? '--'))
      )

      // 组合 CSV 内容（加 BOM 防止 Excel 中文乱码）
      const csvContent =
        '\uFEFF' +
        [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')

      // 下载
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      resolve(true)
    })
  } catch (error) {
    return Promise.reject(error)
  }
}
