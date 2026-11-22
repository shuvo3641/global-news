import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
export declare const initializeSocket: (httpServer: HttpServer) => Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare const getIO: () => Server;
//# sourceMappingURL=socket.d.ts.map