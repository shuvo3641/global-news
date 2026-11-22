import { Comment } from "./comment.model.js";
// Create Comment
export const createCommentItem = async (data) => {
    const comment = await Comment.create(data);
    return comment;
};
//# sourceMappingURL=comment.service.js.map