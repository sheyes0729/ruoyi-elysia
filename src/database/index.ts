import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const poolConfig = {
  host: process.env.DB_HOST ?? "localhost",
  port: parseInt(process.env.DB_PORT ?? "3306"),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "password",
  database: process.env.DB_NAME ?? "ruoyi",
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_SIZE ?? "10"),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

const pool = mysql.createPool(poolConfig);

export const db = drizzle(pool, { schema, mode: "default" });
export * from "./schema";

export async function checkDbHealth(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.query("SELECT 1");
    connection.release();
    return true;
  } catch {
    return false;
  }
}
