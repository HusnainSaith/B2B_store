import { MigrationInterface, QueryRunner } from 'typeorm';
export class ReturnAndCancellationIntegrity1700000000026 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE returns DROP CONSTRAINT IF EXISTS returns_status_check`);
    await q.query(`ALTER TABLE returns ADD CONSTRAINT returns_status_check CHECK (status IN ('requested','approved','rejected','item_shipped','item_received','inspecting','refund_processed','exchanged','closed'))`);
    await q.query(`ALTER TABLE inventory_movements ADD COLUMN reference_id UUID`);
    await q.query(`CREATE UNIQUE INDEX uq_inventory_cancellation_reversal ON inventory_movements(order_id, warehouse_id, variant_id, movement_type) WHERE movement_type = 'cancellation'`);
    await q.query(`CREATE UNIQUE INDEX uq_inventory_return_reversal ON inventory_movements(reference_id, warehouse_id, variant_id, movement_type) WHERE movement_type = 'return'`);
    await q.query(`CREATE INDEX IF NOT EXISTS idx_return_items_order_item ON return_items(order_item_id)`);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS idx_return_items_order_item`);
    await q.query(`DROP INDEX IF EXISTS uq_inventory_return_reversal`);
    await q.query(`DROP INDEX IF EXISTS uq_inventory_cancellation_reversal`);
    await q.query(`ALTER TABLE inventory_movements DROP COLUMN IF EXISTS reference_id`);
    await q.query(`ALTER TABLE returns DROP CONSTRAINT IF EXISTS returns_status_check`);
  }
}
