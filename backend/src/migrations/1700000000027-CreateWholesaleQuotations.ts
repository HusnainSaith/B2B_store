import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWholesaleQuotations1700000000027 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE wholesale_inquiries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reference VARCHAR(40) NOT NULL UNIQUE,
        customer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        company_name VARCHAR(200) NOT NULL,
        contact_name VARCHAR(200) NOT NULL,
        contact_email VARCHAR(320) NOT NULL,
        contact_phone VARCHAR(30),
        delivery_country CHAR(2) NOT NULL,
        delivery_city VARCHAR(120),
        notes TEXT,
        status VARCHAR(30) NOT NULL DEFAULT 'submitted'
          CHECK (status IN ('submitted','under_review','quoted','accepted','declined','cancelled','closed')),
        admin_notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX idx_wholesale_inquiries_customer_created
      ON wholesale_inquiries(customer_id, created_at DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_wholesale_inquiries_status_created
      ON wholesale_inquiries(status, created_at DESC)
    `);

    await queryRunner.query(`
      CREATE TABLE wholesale_inquiry_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        inquiry_id UUID NOT NULL REFERENCES wholesale_inquiries(id) ON DELETE CASCADE,
        variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
        requested_quantity INT NOT NULL CHECK (requested_quantity > 0),
        sku_snapshot VARCHAR(200) NOT NULL,
        product_name_snapshot VARCHAR(300) NOT NULL,
        target_unit_price NUMERIC(14,4) CHECK (target_unit_price IS NULL OR target_unit_price >= 0),
        notes TEXT,
        UNIQUE (inquiry_id, variant_id)
      )
    `);
    await queryRunner.query(
      `CREATE INDEX idx_wholesale_inquiry_items_variant ON wholesale_inquiry_items(variant_id)`,
    );

    await queryRunner.query(`
      CREATE TABLE wholesale_quotations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reference VARCHAR(40) NOT NULL UNIQUE,
        inquiry_id UUID NOT NULL REFERENCES wholesale_inquiries(id) ON DELETE RESTRICT,
        created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        status VARCHAR(30) NOT NULL DEFAULT 'sent'
          CHECK (status IN ('draft','sent','accepted','declined','expired','superseded')),
        currency CHAR(3) NOT NULL,
        subtotal NUMERIC(14,4) NOT NULL CHECK (subtotal >= 0),
        discount_amount NUMERIC(14,4) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
        shipping_amount NUMERIC(14,4) NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
        tax_amount NUMERIC(14,4) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
        total_amount NUMERIC(14,4) NOT NULL CHECK (total_amount >= 0),
        terms TEXT,
        internal_notes TEXT,
        expires_at TIMESTAMPTZ NOT NULL,
        responded_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX idx_wholesale_quotations_inquiry_created
      ON wholesale_quotations(inquiry_id, created_at DESC)
    `);
    await queryRunner.query(
      `CREATE INDEX idx_wholesale_quotations_expiry ON wholesale_quotations(status, expires_at)`,
    );

    await queryRunner.query(`
      CREATE TABLE wholesale_quotation_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quotation_id UUID NOT NULL REFERENCES wholesale_quotations(id) ON DELETE CASCADE,
        variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
        quantity INT NOT NULL CHECK (quantity > 0),
        sku_snapshot VARCHAR(200) NOT NULL,
        product_name_snapshot VARCHAR(300) NOT NULL,
        unit_price NUMERIC(14,4) NOT NULL CHECK (unit_price >= 0),
        line_total NUMERIC(14,4) NOT NULL CHECK (line_total >= 0),
        UNIQUE (quotation_id, variant_id)
      )
    `);
    await queryRunner.query(
      `CREATE INDEX idx_wholesale_quotation_items_variant ON wholesale_quotation_items(variant_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP TABLE IF EXISTS wholesale_quotation_items CASCADE',
    );
    await queryRunner.query(
      'DROP TABLE IF EXISTS wholesale_quotations CASCADE',
    );
    await queryRunner.query(
      'DROP TABLE IF EXISTS wholesale_inquiry_items CASCADE',
    );
    await queryRunner.query('DROP TABLE IF EXISTS wholesale_inquiries CASCADE');
  }
}
