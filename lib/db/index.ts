import { Pool } from 'pg';

// DB接続プールの作成
// TODO: 環境変数をちゃんと設定するなりAWSの環境を構築するなりする
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false,
  extra: {
    ssl: { rejectUnauthorized: false } 
  }
});

// 接続テスト
pool.connect((err: Error | undefined, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Successfully connected to database');
  release();
});
