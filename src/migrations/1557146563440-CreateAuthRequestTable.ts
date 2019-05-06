import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAuthRequestTable1557146563440 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(new Table({
      name: 'auth_request',
      columns: [
        {
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'discord_id',
          type: 'text',
          isNullable: false,
        },
        {
          name: 'key',
          type: 'text',
          isNullable: false
        }
      ]
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    queryRunner.dropTable('auth_request');
  }
}
