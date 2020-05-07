import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAdminTable implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.createTable(
      new Table({
        name: 'admin',
        columns: [
          {
            name: 'discord_id',
            type: 'text',
            isNullable: false
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropTable('admin');
  }
}
