import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/new-registration/$id/$guid/$hash')({
  beforeLoad: ({ params }) => {
    // 重定向到正确的路由
    throw redirect({
      to: '/registration/complete/$id/$guid/$hash',
      params: {
        id: params.id,
        guid: params.guid,
        hash: params.hash,
      },
      replace: true,
    })
  }
})

