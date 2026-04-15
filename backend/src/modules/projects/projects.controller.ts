// import { Request, Response } from "express";
// import { z } from "zod";
// import { projectsService } from "./projects.service";

// const createProjectSchema = z.object({
//   name: z.string().min(1),
//   description: z.string().optional(),
//   goals: z.any().optional(),
//   deadline: z.string().optional(),
//   budgetAmount: z.number().positive().optional(),
// });

// const taskSchema = z.object({
//   title: z.string().min(1),
//   description: z.string().optional(),
//   dueDate: z.string().optional(),
//   priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
// });

// const commentSchema = z.object({
//   taskId: z.string().uuid().optional(),
//   body: z.string().min(1),
// });

// export async function createProject(req: Request, res: Response) {
//   const payload = createProjectSchema.parse(req.body);
//   const data = await projectsService.createProject({
//     ...payload,
//     workspaceId: req.workspaceId!,
//     actorUserId: req.auth!.userId,
//   });
//   res.status(201).json({ success: true, data });
// }

// export async function listProjects(req: Request, res: Response) {
//   const data = await projectsService.listProjects(req.workspaceId!);
//   res.json({ success: true, data });
// }

// export async function addProjectTask(req: Request, res: Response) {
//   const payload = taskSchema.parse(req.body);
//   const data = await projectsService.addTask({
//     ...payload,
//     workspaceId: req.workspaceId!,
//     projectId: String(req.params.projectId),
//   });
//   res.status(201).json({ success: true, data });
// }

// export async function addProjectComment(req: Request, res: Response) {
//   const payload = commentSchema.parse(req.body);
//   const data = await projectsService.addComment({
//     ...payload,
//     workspaceId: req.workspaceId!,
//     actorUserId: req.auth!.userId,
//     projectId: String(req.params.projectId),
//   });
//   res.status(201).json({ success: true, data });
// }
