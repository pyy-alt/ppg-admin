import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/forgot-password/$id/$guid/$hash')({
  beforeLoad: ({ params }) => {
    // Redirecting to the correct route
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
  // ❌ Delete this line：component Will not be executed，Because beforeLoad Has already been redirected
  // component: ResetPassword
})
