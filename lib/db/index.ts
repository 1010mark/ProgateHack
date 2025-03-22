import { Pool } from 'pg';

const settings = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false,
  extra: {
    ssl: { rejectUnauthorized: false } 
  }
};
// DB接続プールの作成
// TODO: 環境変数をちゃんと設定するなりAWSの環境を構築するなりする
export const pool = new Pool(settings);

// 接続テスト
pool.connect((err: Error | undefined, client, release) => {
  console.log('settings', settings);
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Successfully connected to database');
  release();
});
