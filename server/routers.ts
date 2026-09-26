import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  deleteWarehouseFileById,
  getWarehouseFileById,
  insertWarehouseFile,
  listWarehouseFiles,
} from "./db";
import { storagePut } from "./storage";

const fileCategory = z.enum(["Receiving", "Inventory", "Orders", "Reports"]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  files: router({
    list: protectedProcedure.query(async () => listWarehouseFiles()),
    upload: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          mimeType: z.string().min(1).max(255),
          sizeBytes: z
            .number()
            .int()
            .positive()
            .max(12 * 1024 * 1024),
          category: fileCategory,
          data: z.string().min(1).max(20_000_000),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const buffer = Buffer.from(input.data, "base64");
        if (buffer.length === 0 || buffer.length > 12 * 1024 * 1024) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "File must be smaller than 12 MB.",
          });
        }
        if (Math.abs(buffer.length - input.sizeBytes) > 3) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "File metadata did not match the uploaded bytes.",
          });
        }

        const safeName = input.name
          .replace(/[^a-zA-Z0-9._-]/g, "_")
          .slice(0, 180);
        const storage = await storagePut(
          `${ctx.user.openId}/warehouse-files/${Date.now()}-${safeName}`,
          buffer,
          input.mimeType
        );
        await insertWarehouseFile({
          name: input.name,
          storageKey: storage.key,
          url: storage.url,
          mimeType: input.mimeType,
          sizeBytes: buffer.length,
          category: input.category,
          uploadedByOpenId: ctx.user.openId,
        });
        return { success: true, url: storage.url } as const;
      }),
    remove: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const file = await getWarehouseFileById(input.id);
        if (!file)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "File not found.",
          });
        if (
          file.uploadedByOpenId !== ctx.user.openId &&
          ctx.user.role !== "admin"
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only remove files you uploaded.",
          });
        }
        await deleteWarehouseFileById(input.id);
        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
