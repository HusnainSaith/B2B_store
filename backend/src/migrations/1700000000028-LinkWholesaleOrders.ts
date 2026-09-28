import { MigrationInterface, QueryRunner } from 'typeorm';

export class LinkWholesaleOrders1700000000028 implements MigrationInterface {
  name = 'LinkWholesaleOrders1700000000028';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN "order_number" varchar(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN "currency" char(3) NOT NULL DEFAULT 'PKR'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN "source" varchar(30) NOT NULL DEFAULT 'retail'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN "wholesale_quotation_id" uuid`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_orders_order_number" ON "orders" ("order_number") WHERE "order_number" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_orders_wholesale_quotation" ON "orders" ("wholesale_quotation_id") WHERE "wholesale_quotation_id" IS NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_wholesale_quotation" FOREIGN KEY ("wholesale_quotation_id") REFERENCES "wholesale_quotations"("id") ON DELETE RESTRICT`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_wholesale_quotation"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_orders_wholesale_quotation"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_order_number"`);
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "wholesale_quotation_id"`,
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "source"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "currency"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "order_number"`);
  }
}
