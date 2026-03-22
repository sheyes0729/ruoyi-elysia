import {
  Registry,
  Counter,
  Histogram,
  Gauge,
  collectDefaultMetrics,
} from "prom-client";

const register = new Registry();

collectDefaultMetrics({ register });

const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "path", "status"],
  registers: [register],
});

const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "path", "status"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

const activeConnections = new Gauge({
  name: "http_active_connections",
  help: "Number of active HTTP connections",
  registers: [register],
});

const redisConnected = new Gauge({
  name: "redis_connected",
  help: "Whether Redis is connected (1 = connected, 0 = disconnected)",
  registers: [register],
});

const dbPoolConnections = new Gauge({
  name: "db_pool_connections",
  help: "Number of database connection pool connections",
  registers: [register],
});

export const metrics = {
  register,
  httpRequestsTotal,
  httpRequestDuration,
  activeConnections,
  redisConnected,
  dbPoolConnections,
};

export { register, redisConnected };
