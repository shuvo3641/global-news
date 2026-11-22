import type { HydratedDocument } from "mongoose"
import { Article, type IArticle } from "./article.model.js"


// Check Article Exists By Category ID
export const checkArticleExistsByCategoryID = async (id: string) => {
    const result = await Article.exists({
        categories: id
    })
    return result
}


// Check Article Exists By Tag ID
export const checkArticleExistsByTagID = async (id: string) => {
    const result = await Article.exists({
        tags: id
    })
    return result
}


// Check Article Exists By Slug
export const checkArticleExistsBySlug = async (slug: string) => {
    const isExists = await Article.exists({slug})
    return isExists
}


// Find Article by ID
export const findArticleById = async (id: string): Promise<HydratedDocument<IArticle> | null> => {
    const article = await Article.findById(id)
    return article
}


// Get Total Articles
export const totalArticleCount = async (filter: any) => {
    const articleCount = await Article.countDocuments(filter)
    return articleCount
}
