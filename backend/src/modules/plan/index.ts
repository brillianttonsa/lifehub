import { Router } from 'express'
import planRoutes from './routes/plan.routes'

const router = Router()

router.use('/', planRoutes)

export default router
