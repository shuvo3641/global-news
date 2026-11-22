export declare const deleteRedisData: (...redisKeys: string[]) => Promise<void>;
export declare const getRedisData: (key: string) => Promise<unknown | null>;
export declare const setRedisData: (redisKey: string, data: unknown, time: number) => Promise<void>;
export declare const getRedisCooldown: (key: string) => Promise<number>;
//# sourceMappingURL=redis.service.d.ts.map