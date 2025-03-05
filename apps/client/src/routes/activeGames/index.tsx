import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/activeGames/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/activeGames/"!</div>
}
