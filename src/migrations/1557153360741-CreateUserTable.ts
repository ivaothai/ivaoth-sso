import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserTable1557153360741 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'discord_id',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'vid',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'firstname',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'lastname',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'rating',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'ratingatc',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'ratingpilot',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'division',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'country',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'staff',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    queryRunner.dropTable('user');
  }
}
