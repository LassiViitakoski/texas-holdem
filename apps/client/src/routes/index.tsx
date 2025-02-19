import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => (
    <div className="p-4" >
      <h1 className="text-2xl font-bold mb-4">Texas Hold'em</h1>
      <p className="text-gray-600">Welcome to the poker game!</p>
    </div>
  ),
});
