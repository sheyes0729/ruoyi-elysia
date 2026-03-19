import { t } from "elysia";

export type UserListItem = {
  userId: number;
  username: string;
  nickName: string;
  status: "0" | "1";
  roleIds: number[];
};

export const UserListItemSchema = t.Object({
  userId: t.Number(),
  username: t.String(),
  nickName: t.String(),
  status: t.Union([t.Literal("0"), t.Literal("1")]),
  roleIds: t.Array(t.Number()),
});

export const ListUserResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    rows: t.Array(UserListItemSchema),
    total: t.Number(),
    pageNum: t.Number(),
    pageSize: t.Number(),
  }),
});

export const UserFailResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Null(),
});
