import type { Role } from '../db/schema'

declare global {
  namespace Express {
    interface Request {
      /** Authenticated user id, set by requireAuth middleware */
      userId?: string
      /** Caller's role within the project in scope, set by loadProjectRole */
      projectRole?: Role
    }
  }
}

export {}
