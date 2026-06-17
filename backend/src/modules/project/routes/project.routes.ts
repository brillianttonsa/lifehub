import { Router } from 'express'
import {ProjectController} from '../controllers/project.controller'
import {EntryController} from '../controllers/entry.controller'
import {MemberController} from '../controllers/member.controller'
import { authMiddleware } from '../../../middlewares/auth.middleware'
import { asyncHandler } from '../../../utils/asyncHandler';
import { loadProjectRole, requireCapability, can } from '../../../middlewares/permissions'
import { validate } from '../../../middlewares/validate.middleware'
import {
  createProjectSchema,
  createEntrySchema,
  inviteMemberSchema,
  updateMemberSchema,
} from '../../schemas'

const router = Router()

// All project routes require an authenticated user
router.use(authMiddleware)

// ── Project collection ───────────────────────────────────
router.get('/', asyncHandler(ProjectController.list))
router.post('/', validate(createProjectSchema), asyncHandler(ProjectController.create))

// ── Single project (must be a member) ────────────────────
router.get('/:id', loadProjectRole, asyncHandler(ProjectController.get))
router.delete(
  '/:id',
  loadProjectRole,
  requireCapability(can.manageProject, 'Only the owner can delete a project'),
  asyncHandler(ProjectController.delete),
)

// ── Entries (nested, :projectId) ─────────────────────────
router.get('/:projectId/entries', loadProjectRole, asyncHandler(EntryController.list))
router.post(
  '/:projectId/entries',
  loadProjectRole,
  requireCapability(can.writeEntry, 'You do not have permission to write entries'),
  validate(createEntrySchema),
  asyncHandler(EntryController.create),
)
router.delete('/:projectId/entries/:entryId', loadProjectRole, asyncHandler(EntryController.remove))

// ── Members (owner-managed) ──────────────────────────────
router.get('/:projectId/members', loadProjectRole, asyncHandler(MemberController.list))
router.post(
  '/:projectId/members',
  loadProjectRole,
  requireCapability(can.manageProject, 'Only the owner can manage members'),
  validate(inviteMemberSchema),
  asyncHandler(MemberController.add),
)
router.patch(
  '/:projectId/members/:userId',
  loadProjectRole,
  requireCapability(can.manageProject, 'Only the owner can manage members'),
  validate(updateMemberSchema),
  asyncHandler(MemberController.update),
)
router.delete(
  '/:projectId/members/:userId',
  loadProjectRole,
  requireCapability(can.manageProject, 'Only the owner can manage members'),
  asyncHandler(MemberController.remove),
)

export default router
