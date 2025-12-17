import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/new-registration/$id/$guid/$hash')({
  beforeLoad: ({ params }) => {
    // Redirecting to the correct route
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

