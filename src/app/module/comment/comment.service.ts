import { Comment, type IComment } from "./comment.model.js"

// Create Comment
export const createCommentItem = async (data: IComment) => {
    const comment = await Comment.create(data)
    return comment
}