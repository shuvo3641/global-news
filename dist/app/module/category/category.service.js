import { Category } from "./category.model.js";
// Find category By ID
export const findCategoryById = async (id) => {
    const category = await Category.findById(id);
    return category;
};
// Find category By Slug
export const findCategoryBySlug = async (slug) => {
    const category = await Category.findOne({ slug });
    return category;
};
// Cteate Category
export const createCategoryItem = async (categoryData) => {
    const category = await Category.create(categoryData);
    return category;
};
// Get Total Categories
export const getTotalCategories = async (filter) => {
    const total = await Category.countDocuments(filter);
    return total;
};
// Delete Category By ID
export const deleteCategoryById = async (id) => {
    const deleted = await Category.findByIdAndDelete(id);
    return deleted;
};
//# sourceMappingURL=category.service.js.map