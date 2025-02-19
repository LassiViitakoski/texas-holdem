import { GameList } from "@/components/games/GameList";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/games/")({
  component: GameList,
});

