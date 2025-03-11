import { PrismaClient, TablePosition } from '@prisma/client';

export class TablePositionRepository {
  constructor(private client: PrismaClient) {}

  update(tablePositionId: number, data: Partial<TablePosition>) {
    return this.client.tablePosition.update({
      where: { id: tablePositionId },
      data,
    });
  }
}
