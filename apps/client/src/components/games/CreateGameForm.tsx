import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { NumberInput } from '@/components/ui/NumberInput';
import { Button } from '@/components/ui/Button';
import { BlindInputs } from './BlindInputs';
import { useCreateGame } from '@/hooks/useGames';
import { useNavigate } from '@tanstack/react-router';

const gameFormSchema = z.object({
  maxPlayers: z.number().min(2).max(9),
  buyIn: z.number().min(1),
  blinds: z.array(z.number()).length(2).refine(
    ([small, big]) => big > small,
    "Big blind must be larger than small blind"
  ),
});

type GameFormValues = z.infer<typeof gameFormSchema>;

export function CreateGameForm() {
  const createGame = useCreateGame();
  const navigate = useNavigate();

  const form = useForm<GameFormValues>({
    defaultValues: {
      maxPlayers: 3,
      buyIn: 100,
      blinds: [10, 20],
    },
    onSubmit: async (values) => {
      await createGame.mutateAsync(values.value);
      navigate({ to: '/games' });
    },
    validators: {
      onSubmit(values) {
        const validationResult = gameFormSchema.safeParse(values.value)

        if (!validationResult.success) {
          return {
            form: 'Invalid data in form',
            fields: {
              blinds: 'Invalid blinds...'
            }
          }
        }

        return null;
      },
    }

  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4 max-w-md mx-auto"
    >
      <form.Field
        name="maxPlayers"
        children={(field) => (
          <div>
            <NumberInput
              label="Maximum Players"
              min={2}
              max={9}
              value={field.state.value}
              onChange={(e) => field.setValue(Number(e.target.value))}
            />
            {field.state.meta.errors?.[0] && (
              <p className="mt-1 text-sm text-red-600">
                {field.state.meta.errors.join(', ')}
              </p>
            )}
          </div>
        )}
      />

      <form.Field
        name="buyIn"
        children={(field) => (
          <div>
            <NumberInput
              label="Buy In"
              min={1}
              value={field.state.value}
              onChange={(e) => field.setValue(Number(e.target.value))}
            />
            {field.state.meta.errors?.[0] && (
              <p className="mt-1 text-sm text-red-600">
                {field.state.meta.errors.join(', ')}
              </p>
            )}
          </div>
        )}
      />

      <form.Field
        name="blinds"
        children={(field) => (
          <div>
            <BlindInputs
              blinds={field.state.value}
              onChange={field.setValue}
            />
            {field.state.meta.errors?.[0] && (
              <p className="mt-1 text-sm text-red-600">
                {field.state.meta.errors.join(', ')}
              </p>
            )}
          </div>
        )}
      />

      <Button
        type="submit"
        disabled={form.state.isSubmitting || !form.state.canSubmit}
      >
        {form.state.isSubmitting ? 'Creating...' : 'Create Game'}
      </Button>

      {import.meta.env.DEV && (
        <pre className="mt-4 p-4 bg-gray-100 rounded text-xs">
          {JSON.stringify(form.state, null, 2)}
        </pre>
      )}
    </form>
  );
} 