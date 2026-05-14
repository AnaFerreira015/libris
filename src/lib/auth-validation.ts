import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(7, "A senha deve ter mais de 6 caracteres"),
});

export type LoginValues = z.infer<typeof loginSchema>;
