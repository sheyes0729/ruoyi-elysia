export type ApiResponse<T> = {
  code: number;
  msg: string;
  data: T;
};

export const ok = <T>(data: T, msg = "操作成功"): ApiResponse<T> => ({
  code: 200,
  msg,
  data,
});

export const fail = (code: number, msg: string): ApiResponse<null> => ({
  code,
  msg,
  data: null,
});
