import { Elysia, t } from "elysia";
import { secured } from "../../../common/auth/secured";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import { fileService } from "./service";

const UploadBodySchema = t.Object({
  file: t.File(),
});

type UploadBody = typeof UploadBodySchema.static;

export const uploadRoutes = new Elysia({
  prefix: "/api/upload",
  name: "system.upload.routes",
})
  .use(securityPlugin)
  .post(
    "",
    secured(
      {
        permission: "system:upload:upload",
        denyMessage: "无权限上传文件",
      },
      async ({ body, set }) => {
        const typedBody = body as UploadBody;
        const file = typedBody.file;

        try {
          const result = await fileService.upload(file);
          return ok(result, "上传成功");
        } catch (error) {
          set.status = 400;
          return fail(400, error instanceof Error ? error.message : "上传失败");
        }
      },
    ),
    {
      body: UploadBodySchema,
      detail: {
        tags: ["系统管理-文件上传"],
        summary: "上传文件",
        description:
          "上传文件到服务器，支持图片和PDF。文件大小限制10MB。需具有system:upload:upload权限。",
      },
    },
  )
  .delete(
    "/:fileName",
    secured(
      {
        permission: "system:upload:remove",
        denyMessage: "无权限删除文件",
      },
      async ({ params, set }) => {
        const typedParams = params as { fileName: string };
        const removed = await fileService.delete(typedParams.fileName);

        if (!removed) {
          set.status = 404;
          return fail(404, "文件不存在");
        }

        return ok(true, "删除成功");
      },
    ),
    {
      params: t.Object({
        fileName: t.String(),
      }),
      detail: {
        tags: ["系统管理-文件上传"],
        summary: "删除文件",
        description: "删除已上传的文件。需具有system:upload:remove权限。",
      },
    },
  );
