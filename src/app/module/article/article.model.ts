import {Schema, model, Types} from "mongoose"

export interface IArticle {
    title: string,
    slug: string,
    excerpt: string,
    content: string,
    coverImage: {
        url: string;
        altTag: string;
    };
    author: Types.ObjectId,
    categories: Types.ObjectId[],
    tags: Types.ObjectId[],
    isFeatured: boolean,
    allowComments: boolean,
    status: "DRAFT" | "SUBMITTED" | "REJECTED" | "PUBLISHED",
    publishAt: Date | null,
    reviewNote: string,
    metaTitle: string,
    metaDescription: string,
    metaKeywords: string[],
}

const articleSchema = new Schema<IArticle>({

    title: {type: String, required: true, trim: true},

    slug: {type: String, required: true, unique: true, trim: true, lowercase: true},

    excerpt: {type: String, trim: true, default: ""},

    content: {type: String, required: true},

    coverImage: {

        url: {type: String, required: true, trim: true},

        altTag: {type: String, trim: true, default: ""},
        
    },

    author: {type: Schema.Types.ObjectId, ref: "User", required: true},

    categories: [{type: Schema.Types.ObjectId, ref: "Category", required: true}],

    tags: [{type: Schema.Types.ObjectId, ref: "Tag"}],

    status: {type: String, enum: ["DRAFT", "SUBMITTED", "REJECTED", "PUBLISHED"], default: "DRAFT"},

    publishAt: {type: Date, default: null},

    isFeatured: {type: Boolean, default: false},

    allowComments: {type: Boolean, default: false},

    reviewNote: {type: String, trim: true, default: ""},

    metaTitle: {type: String, trim: true, default: ""},

    metaDescription: {type: String, trim: true, default: ""},

    metaKeywords: [{type: String, trim: true, lowercase: true}]

}, {timestamps: true})

// Text Index
articleSchema.index(
    {
        title: "text",
        content: "text"
    },
    {
        weights: {
            title: 10,
            content: 5
        }
    }
)

// Category + Status
articleSchema.index({
    categories: 1,
    status: 1
})

// Tag + Status
articleSchema.index({
    tags: 1,
    status: 1
})

// Category + CreatedAt
articleSchema.index({
    categories: 1,
    createdAt: -1
})

// Tag + CreatedAt
articleSchema.index({
    tags: 1,
    createdAt: -1
})

// Status + CreatedAt
articleSchema.index({
    status: 1,
    createdAt: -1
})

// Category + Status + CreatedAt
articleSchema.index({
    categories: 1,
    status: 1,
    createdAt: -1
})

// Tag + Status + CreatedAt
articleSchema.index({
    tags: 1,
    status: 1,
    createdAt: -1
})


export const Article = model<IArticle>("Article", articleSchema)

