import { z } from "zod";
export const createContactMessageSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2, "Full name must be at least 2 characters")
        .max(100, "Full name cannot exceed 100 characters"),
    subject: z
        .string()
        .trim()
        .min(3, "Subject must be at least 3 characters")
        .max(150, "Subject cannot exceed 150 characters"),
    message: z
        .string()
        .trim()
        .min(10, "Message must be at least 10 characters")
        .max(5000, "Message cannot exceed 5000 characters"),
});
//# sourceMappingURL=contact.validation.js.map