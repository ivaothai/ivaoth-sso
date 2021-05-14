import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddConsentTime1621007020175 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'consentTime',
        type: 'datetime',
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user', 'consentTime');
  }
}
