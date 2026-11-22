import "dotenv/config";
import { z } from "zod";
const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().int().positive().default(5000),
    APP_NAME: z.string().default(""),
    CLIENT_URL: z.string().default(""),
    MONGODB_URI: z.string().default(""),
    REDIS_URI: z.string().default(""),
    JWT_VERIFY_SECRET: z.string().default(""),
    JWT_ACCESS_SECRET: z.string().default(""),
    JWT_REFRESH_SECRET: z.string().default(""),
    COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("none"),
    SMTP_HOST: z.string().default(""),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_SECURE: z.enum(["true", "false"]).default("false"),
    SMTP_USER: z.string().default(""),
    SMTP_PASSWORD: z.string().default(""),
    GOOGLE_AUTH_WEB_CLIENT_ID: z.string().default(""),
    GOOGLE_AUTH_ANDROID_CLIENT_ID: z.string().default(""),
    GOOGLE_AUTH_IOS_CLIENT_ID: z.string().default(""),
    CLOUDINARY_CLOUD_NAME: z.string().default(""),
    CLOUDINARY_API_KEY: z.string().default(""),
    CLOUDINARY_API_SECRET: z.string().default("")
});
const env = envSchema.parse(process.env);
export const config = {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    appName: env.APP_NAME,
    clientUrl: env.CLIENT_URL,
    mongodbUri: env.MONGODB_URI,
    redisUri: env.REDIS_URI,
    jwtVerifySecret: env.JWT_VERIFY_SECRET,
    jwtAccessSecret: env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: env.JWT_REFRESH_SECRET,
    cookieSameSite: env.COOKIE_SAME_SITE,
    smtpHost: env.SMTP_HOST,
    smtpPort: env.SMTP_PORT,
    smtpSecure: env.SMTP_SECURE,
    smtpUser: env.SMTP_USER,
    smtpPassword: env.SMTP_PASSWORD,
    googleAuthWebClientId: env.GOOGLE_AUTH_WEB_CLIENT_ID,
    googleAuthAndroidClientId: env.GOOGLE_AUTH_ANDROID_CLIENT_ID,
    googleAuthIosClientId: env.GOOGLE_AUTH_IOS_CLIENT_ID,
    cloudinaryCloudName: env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: env.CLOUDINARY_API_SECRET
};
//# sourceMappingURL=config.js.map