import { t } from "elysia";

export const ListConfigSchema = t.Object({
  pageNum: t.Optional(t.Numeric({ minimum: 1 })),
  pageSize: t.Optional(t.Numeric({ minimum: 1, maximum: 200 })),
  configName: t.Optional(t.String()),
  configKey: t.Optional(t.String()),
  configType: t.Optional(t.Union([t.Literal("Y"), t.Literal("N")])),
});

export type ListConfigQuery = typeof ListConfigSchema.static;

export type ConfigListItem = {
  configId: number;
  configName: string;
  configKey: string;
  configValue: string;
  configType: "Y" | "N";
};

export const ConfigListItemSchema = t.Object({
  configId: t.Number(),
  configName: t.String(),
  configKey: t.String(),
  configValue: t.String(),
  configType: t.Union([t.Literal("Y"), t.Literal("N")]),
});

export const ListConfigResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    rows: t.Array(ConfigListItemSchema),
    total: t.Number(),
    pageNum: t.Number(),
    pageSize: t.Number(),
  }),
});

export const ConfigFailResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Null(),
});
