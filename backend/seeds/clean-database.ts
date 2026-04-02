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

async function clean() {
  await dataSource.initialize();
  const qr = dataSource.createQueryRunner();
  await qr.connect();

  try {
    console.log('\n🧹  Cleaning all database tables...\n');

    await qr.query(`SET session_replication_role = 'replica'`);

    const tables: { tablename: string }[] = await qr.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'migrations'`,
    );

    for (const { tablename } of tables) {
      await qr.query(`TRUNCATE TABLE "${tablename}" CASCADE`);
      console.log(`  🗑️  Truncated: ${tablename}`);
    }

    await qr.query(`SET session_replication_role = 'origin'`);

    console.log('\n✅  Database cleaned successfully.\n');
  } catch (error) {
    console.error('\n❌ Clean failed:', error);
    process.exit(1);
  } finally {
    await qr.release();
    await dataSource.destroy();
  }
}

clean();
