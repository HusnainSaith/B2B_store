import { MigrationInterface, QueryRunner } from 'typeorm';

export class CheckoutReliability1700000000025 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check`);
    await queryRunner.query(`ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending_payment','pending','confirmed','processing','shipped','delivered','cancelled','refunded','returned'))`);
    await queryRunner.query(`ALTER TABLE orders ADD COLUMN idempotency_key VARCHAR(100)`);
    await queryRunner.query(`CREATE UNIQUE INDEX uq_orders_user_idempotency ON orders(user_id, idempotency_key) WHERE idempotency_key IS NOT NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX uq_payments_gateway_transaction ON payments(gateway, gateway_tx_id) WHERE gateway_tx_id IS NOT NULL`);
    await queryRunner.query(`CREATE TABLE payment_webhook_events (
      id VARCHAR(255) PRIMARY KEY, provider VARCHAR(30) NOT NULL,
      event_type VARCHAR(100) NOT NULL, processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await queryRunner.query(`CREATE TABLE inventory_movements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
      warehouse_id UUID NOT NULL REFERENCES warehouses(id), variant_id UUID NOT NULL REFERENCES product_variants(id),
      movement_type VARCHAR(30) NOT NULL, quantity INT NOT NULL CHECK (quantity <> 0),
      note TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await queryRunner.query(`CREATE INDEX idx_inventory_movements_order ON inventory_movements(order_id)`);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS inventory_movements`);
    await queryRunner.query(`DROP TABLE IF EXISTS payment_webhook_events`);
    await queryRunner.query(`DROP INDEX IF EXISTS uq_payments_gateway_transaction`);
    await queryRunner.query(`DROP INDEX IF EXISTS uq_orders_user_idempotency`);
    await queryRunner.query(`ALTER TABLE orders DROP COLUMN IF EXISTS idempotency_key`);
    await queryRunner.query(`ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check`);
  }
}
