import type { Role } from '../../db/schema/project';

export const can = {
  manageProject: (role: Role) => role === 'owner',
  writeEntry: (role: Role) => role === 'owner' || role === 'contributor',
  read: (_role: Role) => true,
  comment: (role: Role) =>
    role === 'owner' || role === 'contributor' || role === 'viewer_comment',
};
