import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(user: AuthenticatedUser | null): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => undefined,
    } as TrpcContext["res"],
  };
}

const sampleUser: AuthenticatedUser = {
  id: 1,
  openId: "sample-user",
  email: "sample@example.com",
  name: "Sample User",
  loginMethod: "manus",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("files router", () => {
  it("rejects unauthenticated file-library access", async () => {
    const caller = appRouter.createCaller(createContext(null));
    await expect(caller.files.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects uploads over the supported size limit before storage work", async () => {
    const caller = appRouter.createCaller(createContext(sampleUser));
    await expect(
      caller.files.upload({
        name: "oversized.pdf",
        mimeType: "application/pdf",
        sizeBytes: 12 * 1024 * 1024 + 1,
        category: "Receiving",
        data: "c2tpcHBlZCBzdG9yYWdlIGNhbGw=",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
