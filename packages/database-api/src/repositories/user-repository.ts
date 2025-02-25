import { PrismaClient, User, Prisma } from '@prisma/client';
import {
  ResourceNotFoundError,
  DuplicateResourceError,
  DatabaseError,
} from '../errors/domain-errors';

interface CreateUserParams {
  username: string;
  email: string;
  phone?: string;
}

interface UpdateUserParams {
  username?: string;
  email?: string;
  phone?: string;
}

export class UserRepository {
  constructor(private client: PrismaClient) {}

  // Used by getUsers handler
  async findAll() {
    return this.client.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    }).catch(() => {
      throw new DatabaseError('Failed to fetch users');
    });
  }

  // Used by getUserById handler
  async findById(id: number) {
    const user = await this.client.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    }).catch(() => {
      throw new DatabaseError('Failed to fetch user');
    });

    if (!user) {
      throw new ResourceNotFoundError('User');
    }

    return user;
  }

  // Used by createUser handler
  async create(data: CreateUserParams): Promise<User> {
    return this.client.user.create({
      data: {
        username: data.username,
        email: data.email,
        phone: data.phone,
      },
    }).catch((error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new DuplicateResourceError('A user with this email already exists');
        }
      }
      throw new DatabaseError('Failed to create user');
    });
  }

  // Used by updateUser handler
  async update(id: number, data: UpdateUserParams): Promise<User> {
    return this.client.user.update({
      where: { id },
      data: {
        username: data.username,
        email: data.email,
        phone: data.phone,
      },
    }).catch((error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new DuplicateResourceError('A user with this email already exists');
        }
        if (error.code === 'P2025') {
          throw new ResourceNotFoundError('User');
        }
      }
      throw new DatabaseError('Failed to update user');
    });
  }
}
