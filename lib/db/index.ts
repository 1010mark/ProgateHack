import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

// SSL証明書のパスを設定
const sslCertPath = join(process.cwd(), 'certs', 'global-bundle.pem');

const settings = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: true,
  extra: {
    ca: readFileSync(sslCertPath).toString(),
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
