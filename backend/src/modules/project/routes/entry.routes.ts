import { Router } from 'express'
import { CommentController } from '../controllers/comment.controller'
import { authMiddleware } from '../../../middlewares/auth.middleware'
import { asyncHandler } from '../../../utils/asyncHandler';
import { validate } from '../../../middlewares/validate.middleware'
import { createCommentSchema } from '../../schemas'

// Top-level entry routes: comments are addressed by entry id only.
// Membership + capability checks happen inside the controllers.
const router = Router()

router.use(authMiddleware)

router.get('/:entryId/comments', asyncHandler(CommentController.list))
router.post('/:entryId/comments', validate(createCommentSchema), asyncHandler(CommentController.create))
router.delete('/:entryId/comments/:commentId', asyncHandler(CommentController.remove))

export default router
