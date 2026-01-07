import { createFileRoute } from '@tanstack/react-router'
import { Loading } from '@/components/Loading'

function AuthenticatedIndex() {
  // This component only renders when user visits the root path "/"
  // The redirect logic is handled by _authenticated/route.tsx getRedirectTarget function
  // So we just show a loading state here
  return <Loading />
}

export const Route = createFileRoute('/_authenticated/')({
  component: AuthenticatedIndex,
})
