import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/forgot-password/$id/$guid/$hash')({
  beforeLoad: ({ params }) => {
    // 重定向到正确的路由
    throw redirect({
      to: '/password/reset/$id/$guid/$hash',
      params: {
        id: params.id,
        guid: params.guid,
        hash: params.hash,
      },
      replace: true,
    })
  },
  // ❌ 删除这行：component 不会被执行，因为 beforeLoad 已经重定向了
  // component: ResetPassword
})
