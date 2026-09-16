import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export const listingSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  storage: z.string().min(1, "Storage is required"),
  condition: z.enum(["MINT", "NORMAL", "DAMAGED"]),
  completeness: z.array(z.string()).optional(),
  photos: z
    .array(z.string())
    .min(1, "At least one photo is required")
    .max(5, "Maximum 5 photos allowed")
    .refine(
      (photos) => photos.every((p) => p.length <= 5 * 1024 * 1024),
      "Each photo must be under ~5MB"
    ),
  askingPrice: z.number().positive().optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be at most 2000 characters")
    .optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  storage: z.string().min(1, "Storage is required"),
  condition: z.enum(["NEW", "LIKE_NEW", "USED"]),
  price: z.number().positive("Price must be positive"),
  stockStatus: z.enum(["AVAILABLE", "BOOKED", "SOLD", "DRAFT"]).optional(),
  description: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

export const settingsSchema = z.object({
  adminWhatsappNumber: z.string().min(1, "WhatsApp number is required"),
  messageTemplateJual: z.string().min(1, "Sell message template is required"),
  messageTemplateBeli: z.string().min(1, "Buy message template is required"),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
