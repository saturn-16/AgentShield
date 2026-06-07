import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const promptScanSchema = z.object({
  content: z.string().min(1, "Prompt cannot be empty"),
});

export const urlScanSchema = z.object({
  url: z.string().min(4, "Please enter a valid URL"),
});

export const reportCreateSchema = z.object({
  report_type: z.enum(["scan_summary", "threat_assessment", "compliance", "agent_analysis"]),
});

export const settingsSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});
