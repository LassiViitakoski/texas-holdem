import { createFileRoute } from '@tanstack/react-router';
import { useSearch } from '@tanstack/react-router';
import { useUsers, useCreateUser } from '@/hooks/useUsers';
import { twMerge } from 'tailwind-merge';
import { useEffect } from 'react';

export const Route = createFileRoute('/')({
  component: () => {
    const search = useSearch({ from: '/' }) as { username: string };
    const urlUsername = search.username || '';

    // Get users and create user mutation
    const { data: users, isLoading } = useUsers();
    const createUser = useCreateUser();

    useEffect(() => {
      const match = users?.find(user => user.username === urlUsername);

      if (match) {
        window.localStorage.setItem('current-user', JSON.stringify(match));
      }
    }, [urlUsername, users])

    console.log('users', users);

    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Texas Hold'em</h1>
        <p className="text-gray-600">Welcome to the poker game!</p>
        <button
          type="button"
          className={twMerge(
            "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700",
            "transition-colors duration-200 disabled:bg-gray-400",
            "disabled:cursor-not-allowed focus:outline-none focus:ring-2",
            "focus:ring-blue-500 focus:ring-offset-2"
          )}
          disabled={isLoading || users?.some(user => user.username === urlUsername)}
          onClick={async () => {
            try {
              await createUser.mutateAsync({
                username: urlUsername,
                email: `${urlUsername}@example.com`, // Temporary email, you might want to handle this differently
              });
            } catch (error) {
              console.error('Failed to create user:', error);
            }
          }}
        >
          Create User
        </button>
      </div >
    )
  },
});
