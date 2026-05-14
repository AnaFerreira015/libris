import { describe, expect, it } from "vitest";

import { loginSchema } from "./auth-validation";

describe("loginSchema", () => {
  it("accepts a valid email and a password with more than six characters", () => {
    const result = loginSchema.safeParse({
      email: "ana@example.com",
      password: "1234567",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid credentials", () => {
    const result = loginSchema.safeParse({
      email: "invalid-email",
      password: "123456",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join("."))).toEqual([
      "email",
      "password",
    ]);
  });
});
