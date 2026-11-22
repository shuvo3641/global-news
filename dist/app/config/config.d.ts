import "dotenv/config";
export declare const config: {
    nodeEnv: "development" | "production" | "test";
    port: number;
    appName: string;
    clientUrl: string;
    mongodbUri: string;
    redisUri: string;
    jwtVerifySecret: string;
    jwtAccessSecret: string;
    jwtRefreshSecret: string;
    cookieSameSite: "lax" | "none" | "strict";
    smtpHost: string;
    smtpPort: number;
    smtpSecure: "false" | "true";
    smtpUser: string;
    smtpPassword: string;
    googleAuthWebClientId: string;
    googleAuthAndroidClientId: string;
    googleAuthIosClientId: string;
    cloudinaryCloudName: string;
    cloudinaryApiKey: string;
    cloudinaryApiSecret: string;
};
//# sourceMappingURL=config.d.ts.map