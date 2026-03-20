const portValue = Number(process.env.PORT ?? "4000");

if (Number.isNaN(portValue) || portValue <= 0 || portValue > 65535) {
  throw new Error("Invalid PORT value");
}

export const env = {
  port: portValue,
  jwtSecret: process.env.JWT_SECRET ?? "ruoyi-elysia-secret",
  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? "3306"),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "password",
    database: process.env.DB_NAME ?? "ruoyi",
  },
};
