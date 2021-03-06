import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CreateNicknameOnUsers1557162358099 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'customNickname',
        type: 'text',
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user', 'customNickname');
  }
}
