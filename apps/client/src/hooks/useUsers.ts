import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface User {
  id: number;
  username: string;
  email: string;
  phone: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

interface CreateUserData {
  username: string;
  email: string;
  phone?: string;
}

const API_URL = '/api/users';

export const useUsers = () => {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUserData) => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useLocalStorageUser = () => {
  const item = window.localStorage.getItem('current-user');

  if (!item) {
    throw new Error('User not found from local storage');
  }

  return JSON.parse(item);
}