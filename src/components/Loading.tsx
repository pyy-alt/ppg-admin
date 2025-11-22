export function Loading() {
  return (
    <div className='flex h-screen items-center justify-center'>
      <div className='text-center'>
        <div className='mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600 mx-auto'></div>
        <p className='text-muted-foreground text-sm'>Loading...</p>
      </div>
    </div>
  )
}