import { Router } from 'express'
import { PlanController } from '../controllers/plan.controller'
import { authMiddleware } from '../../../middlewares/auth.middleware'
import { asyncHandler } from '../../../utils/asyncHandler'
import { validate } from '../../../middlewares/validate.middleware'
import {
  createPlanSchema,
  updatePlanSchema,
  updatePlanProgressSchema,
} from '../../schemas'

const router = Router()
const controller = PlanController

router.use(authMiddleware)

router.get('/dashboard', asyncHandler(controller.dashboard))
router.get('/search', asyncHandler(controller.search))
router.get('/', asyncHandler(controller.list))
router.get('/:id', asyncHandler(controller.get))
router.post('/', validate(createPlanSchema), asyncHandler(controller.create))
router.patch('/:id', validate(updatePlanSchema), asyncHandler(controller.update))
router.delete('/:id', asyncHandler(controller.delete))
router.patch('/:id/archive', asyncHandler(controller.archive))
router.patch('/:id/progress', validate(updatePlanProgressSchema), asyncHandler(controller.updateProgress))

export default router
