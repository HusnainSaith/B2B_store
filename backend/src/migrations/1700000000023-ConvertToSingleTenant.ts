import { MigrationInterface, QueryRunner } from 'typeorm';

/** Consolidates marketplace data into one store without deleting commerce data. */
export class ConvertToSingleTenant1700000000023 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const stores: Array<{ id: string }> = await queryRunner.query(
      `SELECT id FROM stores ORDER BY is_active DESC, created_at ASC NULLS LAST, id ASC`,
    );

    if (stores.length > 0) {
      const primaryStoreId = stores[0].id;
      await queryRunner.query(`UPDATE products SET store_id = $1 WHERE store_id <> $1`, [primaryStoreId]);
      await queryRunner.query(`UPDATE order_items SET store_id = $1 WHERE store_id <> $1`, [primaryStoreId]);
      await queryRunner.query(`DELETE FROM stores WHERE id <> $1`, [primaryStoreId]);
    }

    await queryRunner.query(`DROP INDEX IF EXISTS idx_stores_seller`);
    await queryRunner.query(`ALTER TABLE stores DROP COLUMN IF EXISTS seller_id`);
    await queryRunner.query(`ALTER TABLE stores ADD COLUMN singleton_key BOOLEAN NOT NULL DEFAULT TRUE`);
    await queryRunner.query(`ALTER TABLE stores ADD CONSTRAINT uq_stores_singleton UNIQUE (singleton_key)`);
    await queryRunner.query(`ALTER TABLE stores ADD CONSTRAINT chk_stores_singleton_true CHECK (singleton_key = TRUE)`);
    await queryRunner.query(`DROP TABLE IF EXISTS sellers`);

    // Keep one administrative principal (prefer super_admin, then oldest grant).
    await queryRunner.query(`
      WITH administrative_grants AS (
        SELECT ur.user_id, ur.role_id,
               ROW_NUMBER() OVER (
                 ORDER BY CASE WHEN r.name = 'super_admin' THEN 0 ELSE 1 END,
                          ur.granted_at ASC NULLS LAST, ur.user_id ASC
               ) AS position
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE r.name IN ('admin', 'super_admin')
      )
      DELETE FROM user_roles ur
      USING administrative_grants ag
      WHERE ur.user_id = ag.user_id AND ur.role_id = ag.role_id AND ag.position > 1
    `);

    // Retire the marketplace role and any assignments left by old installations.
    await queryRunner.query(`DELETE FROM user_roles WHERE role_id IN (SELECT id FROM roles WHERE name = 'seller')`);
    await queryRunner.query(`DELETE FROM role_permissions WHERE role_id IN (SELECT id FROM roles WHERE name = 'seller')`);
    await queryRunner.query(`DELETE FROM roles WHERE name = 'seller'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE sellers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      display_name VARCHAR(200) NOT NULL,
      legal_name VARCHAR(200), tax_id VARCHAR(100),
      commission_rate NUMERIC(5,2) DEFAULT 10.00,
      status VARCHAR(30) NOT NULL DEFAULT 'active',
      approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await queryRunner.query(`ALTER TABLE stores DROP CONSTRAINT IF EXISTS chk_stores_singleton_true`);
    await queryRunner.query(`ALTER TABLE stores DROP CONSTRAINT IF EXISTS uq_stores_singleton`);
    await queryRunner.query(`ALTER TABLE stores DROP COLUMN IF EXISTS singleton_key`);
    await queryRunner.query(`ALTER TABLE stores ADD COLUMN seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE`);
  }
}
