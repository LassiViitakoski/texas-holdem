import { createFileRoute, Outlet, Link } from '@tanstack/react-router'
import { GameRoomLayout } from '@/components/layout/GameRoomLayout'

export const Route = createFileRoute('/games/room')({
  component: GameRoomLayout,
})

