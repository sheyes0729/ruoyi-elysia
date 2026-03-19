const portValue = Number(process.env.PORT ?? "3000");

if (Number.isNaN(portValue) || portValue <= 0 || portValue > 65535) {
  throw new Error("Invalid PORT value");
}

export const env = {
  port: portValue,
  jwtSecret: process.env.JWT_SECRET ?? "ruoyi-elysia-secret",
};
