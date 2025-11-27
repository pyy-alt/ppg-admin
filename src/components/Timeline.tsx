// src/components/Timeline.tsx
import { Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface TimelineItem {
  id: number
  title: string
  status?: 'pending' | 'approved' | 'rejected' | 'waiting'
  submitted?: string
  by?: string
  approved?: boolean
  rejected?: boolean
}

const timelineData: TimelineItem[] = [
  {
    id: 1,
    title: 'Order Review',
    status: 'rejected',
    submitted: '2/15/2025 4:01 PM',
    by: 'Jake Renshaw',
  },
  {
    id: 2,
    title: 'Order Fulfillment',
    status: 'pending',
    approved: true,
  },
  {
    id: 3,
    title: 'Order Received',
    status: 'rejected',
  },
]

export function Timeline() {
  return (
    <Card className='p-6'>
      <h2 className='mb-6 text-2xl font-bold'>Parts Tracker</h2>
      <div className='space-y-8'>
        {timelineData.map((item, index) => (
          <div key={item.id} className='flex gap-4'>
            {/* 圆点 + 虚线 */}
            <div className='flex flex-col items-center'>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full p-1 text-sm font-bold text-white ${
                  item.status === 'approved'
                    ? 'bg-green-600'
                    : item.status === 'rejected'
                      ? 'bg-red-500'
                      : item.status === 'waiting'
                        ? 'bg-blue-600'
                        : 'bg-gray-400'
                }`}
              >
                {/* 已处理 → 显示 ✅，否则显示数字 */}
                {item.status === 'approved' ? (
                  <Check className='h-5 w-5' />
                ) : item.status === 'rejected' ? (
                  <X className='h-5 w-5' />
                ) : (
                  item.id
                )}
              </div>

              {/* 虚线 */}
              {index < timelineData.length - 1 && (
                <div className='mt-2 h-full w-px border-l border-gray-300' />
              )}
            </div>

            {/* 内容区域 */}
            <div className='flex-1 pb-8'>
              <div className='mb-1 flex items-center gap-2 p-2'>
                <h3 className='font-semibold'>{item.title}</h3>
                {item.status === 'waiting' && (
                  <Badge className='bg-blue-100 text-blue-700'>
                    Waiting on You
                  </Badge>
                )}
                {item.status === 'pending' && (
                  <Badge className='bg-orange-400 text-muted'>Pending CSR</Badge>
                )}
                {item.status === 'rejected' && (
                  <Badge className='bg-purple-500 text-white'>
                    Waiting on You
                  </Badge>
                )}
                {/* {item.status === 'approved' && (
                  <Badge className="bg-green-100 text-green-700">Approved</Badge>
                )} */}
              </div>
              {/* shop 发起 */}
              {item.submitted && (
                <div>
                  <p className='text-muted-foreground mb-2 text-sm'>
                    Request was Submitted on <strong>{item.submitted}</strong>{' '}
                    by <strong>{item.by}</strong>.
                  </p>
                </div>
              )}

              {/* csr 审核 */}
              {item.approved !== undefined && (
                <div className='flex flex-col gap-2'>
                  {item.id===2 && (
                    <p className='mb-3 text-sm'>This request is</p>
                  )}
                 <div className='flex gap-2'>
                  <Button
                    size='sm'
                    variant={item.approved ? 'default' : 'outline'}
                    className={
                      item.approved ? 'bg-green-600 hover:bg-green-700' : ''
                    }
                  >
                    <Check className='mr-1 h-4 w-4' />
                    Approved
                  </Button>
                  <Button
                    size='sm'
                    variant={item.rejected ? 'default' : 'outline'}
                    className={
                      item.rejected ? 'bg-red-600 hover:bg-red-700' : ''
                    }
                  >
                    <X className='mr-1 h-4 w-4' />
                    Rejected
                  </Button>
                 </div>
                 
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
