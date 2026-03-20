import { t } from "elysia";

export const ListConfigSchema = t.Object({
  pageNum: t.Optional(t.Numeric({ minimum: 1 })),
  pageSize: t.Optional(t.Numeric({ minimum: 1, maximum: 200 })),
  configName: t.Optional(t.String()),
  configKey: t.Optional(t.String()),
  configType: t.Optional(t.Union([t.Literal("Y"), t.Literal("N")])),
});

export type ListConfigQuery = typeof ListConfigSchema.static;

export const RemoveBatchConfigSchema = t.Object({
  ids: t.Array(t.Numeric({ minimum: 1 }), { minItems: 1 }),
});

export const CreateConfigSchema = t.Object({
  configName: t.String({ minLength: 1, maxLength: 100 }),
  configKey: t.String({ minLength: 1, maxLength: 100 }),
  configValue: t.String({ maxLength: 500 }),
  configType: t.Union([t.Literal("Y"), t.Literal("N")]),
});

export type CreateConfigBody = typeof CreateConfigSchema.static;

export const UpdateConfigSchema = t.Object({
  configId: t.Numeric({ minimum: 1 }),
  configName: t.String({ minLength: 1, maxLength: 100 }),
  configKey: t.String({ minLength: 1, maxLength: 100 }),
  configValue: t.String({ maxLength: 500 }),
  configType: t.Union([t.Literal("Y"), t.Literal("N")]),
});

export type UpdateConfigBody = typeof UpdateConfigSchema.static;

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

export const RemoveBatchConfigResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    count: t.Number(),
  }),
});

export const CreateConfigResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    configId: t.Number(),
  }),
});

export const UpdateConfigResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Boolean(),
});

export const ConfigFailResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Null(),
});
