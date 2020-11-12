import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateOAuthStateTable1605167513355 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'oauth_state',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'state',
            type: 'varchar',
            length: '36',
            isNullable: false
          },
          {
            name: 'userId',
            type: 'int'
          }
        ],
        indices: [
          {
            columnNames: ['state']
          }
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
            onUpdate: 'cascade',
            onDelete: 'cascade'
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('oauth_state');
  }
}
