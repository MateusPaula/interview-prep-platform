import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";
import { getRequestContext } from "./composition";

vi.mock("@/infrastructure/supabase/server-client", () => ({
  createSupabaseServerClient: vi.fn(),
}));

const mockedCreateClient = vi.mocked(createSupabaseServerClient);

function supabaseWithUser(userId: string | null): SupabaseClient {
  return {
    auth: {
      async getUser() {
        return userId
          ? { data: { user: { id: userId } }, error: null }
          : {
              data: { user: null },
              error: { message: "Auth session missing" },
            };
      },
    },
  } as unknown as SupabaseClient;
}

beforeEach(() => {
  mockedCreateClient.mockReset();
});

describe("getRequestContext", () => {
  it("returns null when there is no session", async () => {
    mockedCreateClient.mockResolvedValue(supabaseWithUser(null));
    expect(await getRequestContext()).toBeNull();
  });

  it("returns a context bound to the session user", async () => {
    mockedCreateClient.mockResolvedValue(supabaseWithUser("user-42"));
    const context = await getRequestContext();
    expect(context?.userId).toBe("user-42");
    expect(context?.challenges).toBeDefined();
    expect(context?.attempts).toBeDefined();
    expect(context?.confidence).toBeDefined();
    expect(context?.behavioral).toBeDefined();
    expect(context?.aiMentor).toBeDefined();
  });
});
