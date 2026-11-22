interface ISettings {
    type: "app" | "about" | "contact";
    data: any;
}
export declare const Settings: import("mongoose").Model<ISettings, {}, {}, {}, import("mongoose").Document<unknown, {}, ISettings, {}, import("mongoose").DefaultSchemaOptions> & ISettings & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, ISettings>;
export {};
//# sourceMappingURL=settings.model.d.ts.map