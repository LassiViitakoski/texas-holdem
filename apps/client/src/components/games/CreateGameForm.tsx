import { FormEvent, useState } from 'react';
import { NumberInput } from '@/components/ui/NumberInput';
import { Button } from '@/components/ui/Button';
import { BlindInputs } from './BlindInputs';
import { useCreateGame } from '@/hooks/useGames';
import { useNavigate } from '@tanstack/react-router';

export function CreateGameForm() {
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [buyIn, setBuyIn] = useState(100);
  const [blinds, setBlinds] = useState([10, 20]);

  console.log('Create Game Form')

  const createGame = useCreateGame();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createGame.mutateAsync({
        maxPlayers,
        buyIn,
        blinds,
      });
      navigate({ to: '/games' });
    } catch (error) {
      console.error('Failed to create game:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <NumberInput
        label="Maximum Players"
        min={2}
        max={9}
        value={maxPlayers}
        onChange={e => setMaxPlayers(Number(e.target.value))}
      />
      <NumberInput
        label="Buy In"
        min={1}
        value={buyIn}
        onChange={e => setBuyIn(Number(e.target.value))}
      />
      <BlindInputs blinds={blinds} onChange={setBlinds} />
      <Button
        type="submit"
        disabled={createGame.isPending}
      >
        {createGame.isPending ? 'Creating...' : 'Create Game'}
      </Button>
    </form>
  );
} 