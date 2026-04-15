// import { prisma } from "../../config/prisma";
// import { AppError } from "../../shared/errors";

// class ProjectsService {
//   async createProject(input: {
//     workspaceId: string;
//     actorUserId: string;
//     name: string;
//     description?: string;
//     goals?: unknown;
//     deadline?: string;
//     budgetAmount?: number;
//   }) {
//     return prisma.project.create({
//       data: {
//         workspaceId: input.workspaceId,
//         ownerUserId: input.actorUserId,
//         name: input.name,
//         description: input.description,
//         goals: input.goals as any,
//         deadline: input.deadline ? new Date(input.deadline) : undefined,
//         budgetAmount: input.budgetAmount,
//       },
//     });
//   }

//   async listProjects(workspaceId: string) {
//     return prisma.project.findMany({
//       where: { workspaceId, deletedAt: null },
//       include: { tasks: true, comments: true },
//       orderBy: { createdAt: "desc" },
//     });
//   }

//   async addTask(input: {
//     workspaceId: string;
//     projectId: string;
//     title: string;
//     description?: string;
//     dueDate?: string;
//     priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
//   }) {
//     const project = await prisma.project.findFirst({ where: { id: input.projectId, workspaceId: input.workspaceId, deletedAt: null } });
//     if (!project) throw new AppError("Project not found", 404, "NOT_FOUND");
//     return prisma.projectTask.create({
//       data: {
//         workspaceId: input.workspaceId,
//         projectId: input.projectId,
//         title: input.title,
//         description: input.description,
//         dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
//         priority: input.priority ?? "MEDIUM",
//       },
//     });
//   }

//   async addComment(input: {
//     workspaceId: string;
//     actorUserId: string;
//     projectId: string;
//     taskId?: string;
//     body: string;
//   }) {
//     return prisma.projectComment.create({
//       data: {
//         workspaceId: input.workspaceId,
//         authorUserId: input.actorUserId,
//         projectId: input.projectId,
//         taskId: input.taskId,
//         body: input.body,
//       },
//     });
//   }
// }

// export const projectsService = new ProjectsService();
