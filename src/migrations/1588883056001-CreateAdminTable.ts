import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAdminTable1588883056001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
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
    await queryRunner.dropTable('admin');
  }
}
