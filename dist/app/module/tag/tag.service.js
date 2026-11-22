import { Tag } from "./tag.model.js";
// Find Tag By ID
export const findTagById = async (id) => {
    const tag = await Tag.findById(id);
    return tag;
};
// Find Tag By Slug
export const findTagBySlug = async (slug) => {
    const tag = await Tag.findOne({ slug });
    return tag;
};
// Cteate Tag
export const createTagItem = async (tagData) => {
    const tag = await Tag.create(tagData);
    return tag;
};
// Get Total Tags
export const getTotalTags = async (filter) => {
    const total = await Tag.countDocuments(filter);
    return total;
};
// Delete Tag By ID
export const deleteTagById = async (id) => {
    const deleted = await Tag.findByIdAndDelete(id);
    return deleted;
};
//# sourceMappingURL=tag.service.js.map