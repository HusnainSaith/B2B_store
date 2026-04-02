import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ecommerce',
  synchronize: false,
  logging: false,
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const BRANDS = [
  { name: 'Nike', websiteUrl: 'https://www.nike.com' },
  { name: 'Adidas', websiteUrl: 'https://www.adidas.com' },
  { name: 'Apple', websiteUrl: 'https://www.apple.com' },
  { name: 'Samsung', websiteUrl: 'https://www.samsung.com' },
  { name: 'Sony', websiteUrl: 'https://www.sony.com' },
  { name: 'LG', websiteUrl: 'https://www.lg.com' },
  { name: 'Puma', websiteUrl: 'https://www.puma.com' },
  { name: 'Reebok', websiteUrl: 'https://www.reebok.com' },
  { name: 'Levi\'s', websiteUrl: 'https://www.levi.com' },
  { name: 'Zara', websiteUrl: 'https://www.zara.com' },
  { name: 'H&M', websiteUrl: 'https://www.hm.com' },
  { name: 'Gucci', websiteUrl: 'https://www.gucci.com' },
  { name: 'Louis Vuitton', websiteUrl: 'https://www.louisvuitton.com' },
  { name: 'Dell', websiteUrl: 'https://www.dell.com' },
  { name: 'HP', websiteUrl: 'https://www.hp.com' },
  { name: 'Lenovo', websiteUrl: 'https://www.lenovo.com' },
  { name: 'Microsoft', websiteUrl: 'https://www.microsoft.com' },
  { name: 'Google', websiteUrl: 'https://store.google.com' },
  { name: 'Amazon Basics', websiteUrl: 'https://www.amazon.com' },
  { name: 'Philips', websiteUrl: 'https://www.philips.com' },
  { name: 'Bosch', websiteUrl: 'https://www.bosch.com' },
  { name: 'IKEA', websiteUrl: 'https://www.ikea.com' },
  { name: 'Dyson', websiteUrl: 'https://www.dyson.com' },
  { name: 'Canon', websiteUrl: 'https://www.canon.com' },
  { name: 'Nikon', websiteUrl: 'https://www.nikon.com' },
  { name: 'Under Armour', websiteUrl: 'https://www.underarmour.com' },
  { name: 'The North Face', websiteUrl: 'https://www.thenorthface.com' },
  { name: 'Columbia', websiteUrl: 'https://www.columbia.com' },
  { name: 'Xiaomi', websiteUrl: 'https://www.mi.com' },
  { name: 'OnePlus', websiteUrl: 'https://www.oneplus.com' },
];

async function seed() {
  await dataSource.initialize();
  const qr = dataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    console.log('🏷️  Seeding 30 brands...');

    for (const brand of BRANDS) {
      const slug = slugify(brand.name);

      // Upsert: skip if slug already exists
      const existing = await qr.query(
        `SELECT id FROM brands WHERE slug = $1`,
        [slug],
      );

      if (existing.length > 0) {
        console.log(`   ⏭️  "${brand.name}" already exists, skipping`);
        continue;
      }

      await qr.query(
        `INSERT INTO brands (id, name, slug, website_url, is_active)
         VALUES (gen_random_uuid(), $1, $2, $3, true)`,
        [brand.name, slug, brand.websiteUrl],
      );
      console.log(`   ✅ "${brand.name}"`);
    }

    await qr.commitTransaction();
    console.log('\n🎉 Brand seed completed successfully!');
  } catch (err) {
    await qr.rollbackTransaction();
    console.error('❌ Brand seed failed:', err);
    process.exit(1);
  } finally {
    await qr.release();
    await dataSource.destroy();
  }
}

seed();
