import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, inArray, max } from 'drizzle-orm';
import { db } from '../../db';
import { projects, projectMembers, entries } from '../../db/schema/project';
import {users} from '../../db/schema/auth';

export interface ProjectDTO {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  lastEntryDate: string | null;
  members: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  }[];
}

@Injectable()
export class ProjectService {
  private async buildProjectDTOs(projectIds: string[]): Promise<ProjectDTO[]> {
    if (projectIds.length === 0) return [];

    const rows = await db
      .select()
      .from(projects)
      .where(inArray(projects.id, projectIds));

    const memberRows = await db
      .select({
        projectId: projectMembers.projectId,
        role: projectMembers.role,
        id: users.id,
        fullName: users.fullName,
        email: users.email,
      })
      .from(projectMembers)
      .innerJoin(users, eq(users.id, projectMembers.userId))
      .where(inArray(projectMembers.projectId, projectIds));

    const lastEntryRows = await db
      .select({
        projectId: entries.projectId,
        lastDate: max(entries.createdAt),
      })
      .from(entries)
      .where(inArray(entries.projectId, projectIds))
      .groupBy(entries.projectId);

    const lastEntryMap = new Map(lastEntryRows.map((r) => [r.projectId, r.lastDate]));
    const membersByProject = new Map<string, ProjectDTO['members']>();

    for (const m of memberRows) {
      const list = membersByProject.get(m.projectId) ?? [];
      list.push({
        id: m.id,
        fullName: m.fullName ?? '',
        email: m.email,
        role: m.role,
      });
      membersByProject.set(m.projectId, list);
    }

    return rows.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      ownerId: p.ownerId,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      memberCount: membersByProject.get(p.id)?.length ?? 0,
      lastEntryDate: lastEntryMap.get(p.id)?.toISOString() ?? null,
      members: membersByProject.get(p.id) ?? [],
    }));
  }

  async list(userId: string) {
    const memberships = await db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(eq(projectMembers.userId, userId));

    const ids = memberships.map((m) => m.projectId);
    const projects = await this.buildProjectDTOs(ids);

    return projects.sort((a, b) => {
      const aKey = a.lastEntryDate ?? a.createdAt;
      const bKey = b.lastEntryDate ?? b.createdAt;
      return bKey.localeCompare(aKey);
    });
  }

  async get(userId: string, projectId: string) {
    const [membership] = await db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, userId),
        ),
      )
      .limit(1);

    if (!membership) {
      throw new NotFoundException('Project not found');
    }

    const [project] = await this.buildProjectDTOs([projectId]);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async create(userId: string, name: string, description?: string) {
    const project = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(projects)
        .values({
          name,
          description: description || null,
          ownerId: userId,
        })
        .returning();

      await tx.insert(projectMembers).values({
        projectId: created.id,
        userId,
        role: 'owner',
      });

      return created;
    });

    const [dto] = await this.buildProjectDTOs([project.id]);
    return dto;
  }

  async update(userId: string, projectId: string, data: { name: string; description?: string }) {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new NotFoundException('Project not found');
    }

    const [updated] = await db
      .update(projects)
      .set({
        name: data.name,
        description: data.description || null,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning();

    if (!updated) {
      throw new NotFoundException('Project not found');
    }

    const [dto] = await this.buildProjectDTOs([updated.id]);
    return dto;
  }

  async delete(userId: string, projectId: string) {
    await db
      .delete(projects)
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, userId)));
  }
}
