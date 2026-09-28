import { MigrationInterface, QueryRunner } from 'typeorm';

export class HardenCatalogInventory1700000000024 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE inventory SET qty_reserved = GREATEST(0, LEAST(qty_reserved, qty_on_hand))`);
    await queryRunner.query(`ALTER TABLE inventory ADD CONSTRAINT chk_inventory_reserved_valid CHECK (qty_reserved >= 0 AND qty_reserved <= qty_on_hand)`);
    await queryRunner.query(`ALTER TABLE product_variants ADD CONSTRAINT chk_product_variants_price_positive CHECK (price IS NULL OR price > 0)`);
    await queryRunner.query(`ALTER TABLE product_variants ADD CONSTRAINT chk_product_variants_weight_nonnegative CHECK (weight_grams IS NULL OR weight_grams >= 0)`);
    await queryRunner.query(`
      WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY sort_order ASC NULLS LAST, created_at ASC, id ASC) AS position
        FROM product_images WHERE is_primary = TRUE
      )
      UPDATE product_images SET is_primary = FALSE
      WHERE id IN (SELECT id FROM ranked WHERE position > 1)
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX uq_product_images_one_primary ON product_images(product_id) WHERE is_primary = TRUE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS uq_product_images_one_primary`);
    await queryRunner.query(`ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS chk_product_variants_weight_nonnegative`);
    await queryRunner.query(`ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS chk_product_variants_price_positive`);
    await queryRunner.query(`ALTER TABLE inventory DROP CONSTRAINT IF EXISTS chk_inventory_reserved_valid`);
  }
}
