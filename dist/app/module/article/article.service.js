import { Article } from "./article.model.js";
// Check Article Exists By Category ID
export const checkArticleExistsByCategoryID = async (id) => {
    const result = await Article.exists({
        categories: id
    });
    return result;
};
// Check Article Exists By Tag ID
export const checkArticleExistsByTagID = async (id) => {
    const result = await Article.exists({
        tags: id
    });
    return result;
};
// Check Article Exists By Slug
export const checkArticleExistsBySlug = async (slug) => {
    const isExists = await Article.exists({ slug });
    return isExists;
};
// Find Article by ID
export const findArticleById = async (id) => {
    const article = await Article.findById(id);
    return article;
};
// Get Total Articles
export const totalArticleCount = async (filter) => {
    const articleCount = await Article.countDocuments(filter);
    return articleCount;
};
//# sourceMappingURL=article.service.js.map