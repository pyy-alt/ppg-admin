import { useState } from 'react'
import { AlertTriangle, Check, Pencil, Plus } from 'lucide-react'
import navImg from '@/assets/img/repair/nav.png'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PartsOrderDialog } from '@/components/PartsOrderDialog'
import { type PartsOrderData } from '@/components/PartsOrderDialog'
import { Timeline } from '@/components/Timeline'

// 只改这一个文件，替换掉您之前的页面代码
export function RepairOrderDetail() {
  const [isEditPartsOrderDialogOpen, setIsEditPartsOrderDialogOpen] =
    useState(false)
  const [isAddPartsOrderDialogOpen, setIsAddPartsOrderDialogOpen] =
    useState(false)
  const [initialPartsOrderData, setInitialPartsOrderData] =
    useState<PartsOrderData | null>({
      shopRo: '805',
      customer: 'Brian Cooper',
      vin: 'WVWZZZ5CZKK246801',
      make: 'audi',
      year: '2017',
      model: 's3',
      salesOrderNumber: 'SO-174',
      // partsOrderNumber: 1, // 测试补充订单
      orderFromDealership: 'Pacific VW Motors | 88321 (Assigned Dealer)',
      parts: ['06D-115-562X', '1K0-615-301M', '06F-903-023P', '07K-905-715b'],
      estimateFiles: [
        new File(['file_name.pdf'], 'file_name.pdf', {
          type: 'application/pdf',
        }),
        new File(['file_name.pdf'], 'file2_name.pdf', {
          type: 'application/pdf',
        }),
        new File(['file_name.pdf'], 'file3_name.pdf', {
          type: 'application/pdf',
        }),
      ],
      status: 'CsrReview',
      isAlternateDealer: false,
      alternateDealerName: '',
      alternateDealerId: '',
    })
  return (
    <div className='bg-background text-foreground'>
      <div className='mt-8 h-full w-full'>
        <img
          src={navImg}
          alt='Repair Order List'
          className='h-full w-full object-cover'
        />
      </div>
      <div className='mx-4 my-6 p-3'>
        <div className='flex w-full flex-col rounded-sm border'>
          <div className='bg-muted text-foreground flex w-full items-center justify-between p-5'>
            <h1 className='text-2xl font-bold tracking-tight'>
              Repair Order # : 805
            </h1>
            <div className='flex gap-3'>
              <Button
                size='sm'
                className='h-8 bg-green-600 text-xs font-medium'
              >
                <Check className='mr-1.5 h-3.5 w-3.5' />
                Mark Repair as Complete
              </Button>
              <Button
                size='sm'
                variant='outline'
                className='h-8 text-xs font-medium'
              >
                <Pencil className='mr-1.5 h-3.5 w-3.5' />
                Edit Repair Order
              </Button>
            </div>
          </div>
          {/* 2. 信息区 - 极简三列，字体 14px 正文感 */}
          <div className='grid grid-cols-1 gap-8 p-5 md:grid-cols-3'>
            {/* 左列 */}
            <div className='space-y-3'>
              <div>
                <span className='text-muted-foreground'>Customer</span>
                <p className='font-medium'>Brian Cooper</p>
              </div>
              <div>
                <span className='text-muted-foreground'>VIN</span>
                <p className='font-mono'>AUDIZZ5CZKK246801</p>
              </div>
              <div>
                <span className='text-muted-foreground'>Year/Make/Model</span>
                <p className='font-medium'>2017 Audi S3 Sedan</p>
              </div>
            </div>
            {/* 中列 */}
            <div className='space-y-3'>
              <div>
                <span className='text-muted-foreground'>Date Submitted</span>
                <p>02/15/2025 10:23 AM by Jake Renshaw</p>
              </div>
              <div>
                <span className='text-muted-foreground'>Submitted To</span>
                <p className='font-medium'>Pacific Motors (98321)</p>
              </div>
              <div>
                <span className='text-muted-foreground'>Date Closed</span>
                <p className='text-muted-foreground'>---</p>
              </div>
            </div>
            {/* 右列 - 文件链接更紧凑 */}
            <div className='space-y-3 text-sm'>
              <div>
                <span className='text-muted-foreground'>Pre-Repair Photos</span>
                <div className='mt-1 flex flex-wrap gap-2'>
                  {['image1.jpg', 'image2.jpg', 'image3.jpg'].map((f) => (
                    <a
                      key={f}
                      href='#'
                      className='text-blue-700 underline hover:underline'
                    >
                      {f}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <span className='text-muted-foreground'>
                  Structural Measurements
                </span>
                <br />
                <a href='#' className='text-primary hover:underline'>
                  measurements.pdf
                </a>
              </div>
              <div>
                <span className='text-muted-foreground'>
                  Post-Repair Photos
                </span>
                <div className='mt-1 flex flex-wrap gap-2'>
                  {['image 1.jpg', 'image 2.jpg'].map((f) => (
                    <a
                      key={f}
                      href='#'
                      className='text-primary hover:underline'
                    >
                      {f}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='my-5 flex flex-col rounded-sm border'>
          {/* 3. Tabs + 主内容区 */}
          <div className='bg-muted flex items-center justify-between overflow-hidden p-5'>
            {/* 左侧：平铺标签 + 警告 */}
            <div className='flex items-center gap-6 text-sm font-medium'>
              <Button
                variant='outline'
                className='ring-border flex items-center gap-2 rounded-lg px-4 py-2 ring-1'
              >
                Parts Order
              </Button>

              <button className='text-muted-foreground hover:text-foreground bg-accent flex items-center gap-2'>
                <AlertTriangle className='text-destructive h-4 w-4' />
                Supplement 1
              </button>

              <button className='text-muted-foreground hover:text-foreground bg-accent'>
                Supplement 2
              </button>
            </div>

            {/* 右侧：新增按钮 */}
            <Button
              onClick={() => setIsAddPartsOrderDialogOpen(true)}
              variant='outline'
              size='sm'
              className='h-8 rounded-lg font-medium'
            >
              <Plus className='mr-1.5 h-3.5 w-3.5' />
              Supplemental Parts Order
            </Button>
          </div>
          {/* 3. 真正的左右布局（和您截图一模一样） */}
          <div className='m-5 flex gap-8'>
            {' '}
            {/* 关键：flex 横向布局 */}
            {/* 左侧：零件清单卡片（圆角 + 浅背景） */}
            <div className='max-w-lg flex-1'>
              {' '}
              {/* 固定最大宽度，防止太宽 */}
              <Card className='rounded-xl border shadow-sm'>
                <CardHeader className='pb-4'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-foreground text-base font-semibold'>
                      Sales Order #: SO-174
                    </CardTitle>
                    <Button
                      onClick={() => setIsEditPartsOrderDialogOpen(true)}
                      size='sm'
                      variant='outline'
                      className='h-7 px-2 text-xs'
                    >
                      <Pencil className='h-3.5 w-3.5' />
                      Edit Parts Order
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className='space-y-6 text-sm'>
                  <div>
                    <h4 className='text-muted-foreground mb-3 font-medium'>
                      Requested Parts
                    </h4>
                    <ol className='text-foreground/90 space-y-2 pl-5 font-mono'>
                      <li>(1) 06D-115-562X</li>
                      <li>(2) 1K0-615-301M</li>
                      <li>(3) 06F-903-023P</li>
                      <li>(4) 07K-905-715b</li>
                    </ol>
                  </div>

                  <div>
                    <span className='text-muted-foreground'>
                      Parts Estimate
                    </span>
                    <br />
                    <a
                      href='#'
                      className='font-medium text-blue-700 underline hover:underline'
                    >
                      file_name.pdf
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* 右侧：Parts Tracker 时间线（纯文字 + 绿色实线） */}
            <div className='min-w-0 flex-1'>
              {/* min-w-0 防止 flex 溢出 */}
              <Timeline />
            </div>
          </div>
        </div>
      </div>
      <PartsOrderDialog
        open={isAddPartsOrderDialogOpen}
        onOpenChange={setIsAddPartsOrderDialogOpen}
        mode='create'
        defaultDealership='Pacific VW Motors | 88321 (Assigned Dealer)'
      />
      <PartsOrderDialog
        open={isEditPartsOrderDialogOpen}
        onOpenChange={setIsEditPartsOrderDialogOpen}
        mode='edit'
        initialData={initialPartsOrderData}
        defaultDealership='Pacific VW Motors | 111111 (Assigned Dealer)'
      />
    </div>
  )
}
