'use client';

import { useEffect, useState } from 'react';
import {
  FolderKanban,
  Plus,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Clock,
  AlertCircle,
  MessageSquare,
  CalendarClock,
  DollarSign,
  Flag,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { Empty } from '@/components/ui/empty';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import api from '@/lib/api';
import { format, formatDistanceToNow } from 'date-fns';

type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: string;
};

type Comment = {
  id: string;
  body: string;
  taskId?: string;
  createdAt: string;
  author?: {
    name: string;
  };
};

type Project = {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  budgetAmount?: number;
  workspaceId: string;
  status: string;
  tasks: Task[];
  comments: Comment[];
};

export default function ProjectsPage() {
  const { currentWorkspace } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Project form state
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectDeadline, setProjectDeadline] = useState('');
  const [projectBudget, setProjectBudget] = useState('');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<Task['priority']>('MEDIUM');

  // Comment form state
  const [commentBody, setCommentBody] = useState('');

  const fetchProjects = async () => {
    if (!currentWorkspace) return;

    setIsLoading(true);
    try {
      const response = await api.getProjects();
      if (response.success) {
        setProjects(response.data);
      }
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentWorkspace]);

  const resetProjectForm = () => {
    setProjectName('');
    setProjectDescription('');
    setProjectDeadline('');
    setProjectBudget('');
  };

  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate('');
    setTaskPriority('MEDIUM');
  };

  const resetCommentForm = () => {
    setCommentBody('');
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.createProject({
        name: projectName,
        description: projectDescription || undefined,
        deadline: projectDeadline ? new Date(projectDeadline).toISOString() : undefined,
        budgetAmount: projectBudget ? parseFloat(projectBudget) : undefined,
      });

      toast.success('Project created!');
      setIsProjectDialogOpen(false);
      resetProjectForm();
      fetchProjects();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    setIsSubmitting(true);
    try {
      await api.addProjectTask(selectedProject.id, {
        title: taskTitle,
        description: taskDescription || undefined,
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : undefined,
        priority: taskPriority,
      });

      toast.success('Task added!');
      setIsTaskDialogOpen(false);
      resetTaskForm();
      fetchProjects();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    setIsSubmitting(true);
    try {
      await api.addProjectComment(selectedProject.id, {
        body: commentBody,
        taskId: selectedTask?.id,
      });

      toast.success('Comment added!');
      setIsCommentDialogOpen(false);
      resetCommentForm();
      fetchProjects();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-destructive text-destructive-foreground';
      case 'HIGH':
        return 'bg-chart-4 text-chart-4-foreground';
      case 'MEDIUM':
        return 'bg-warning text-warning-foreground';
      case 'LOW':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <AlertCircle className="h-3 w-3" />;
      case 'HIGH':
        return <Flag className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-success/10 text-success border-success/20';
      case 'COMPLETED':
        return 'bg-chart-2/10 text-chart-2 border-chart-2/20';
      case 'ON_HOLD':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const totalTasks = projects.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasks = projects.reduce(
    (acc, p) => acc + p.tasks.filter((t) => t.status === 'DONE').length,
    0
  );
  const urgentTasks = projects.reduce(
    (acc, p) =>
      acc +
      p.tasks.filter(
        (t) => (t.priority === 'URGENT' || t.priority === 'HIGH') && t.status !== 'DONE'
      ).length,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your projects and track progress
          </p>
        </div>
        <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
              <DialogDescription>
                Start a new project to organize your work
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4 mt-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="projectName">Name</FieldLabel>
                  <Input
                    id="projectName"
                    placeholder="e.g., Website Redesign"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="projectDescription">
                    Description (optional)
                  </FieldLabel>
                  <Textarea
                    id="projectDescription"
                    placeholder="What is this project about?"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    rows={3}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="projectDeadline">
                      Deadline (optional)
                    </FieldLabel>
                    <Input
                      id="projectDeadline"
                      type="date"
                      value={projectDeadline}
                      onChange={(e) => setProjectDeadline(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="projectBudget">
                      Budget (optional)
                    </FieldLabel>
                    <Input
                      id="projectBudget"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={projectBudget}
                      onChange={(e) => setProjectBudget(e.target.value)}
                    />
                  </Field>
                </div>
              </FieldGroup>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Spinner className="mr-2" /> : null}
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <FolderKanban className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-sm text-muted-foreground">Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-chart-2/10">
                <Circle className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTasks}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedTasks}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{urgentTasks}</p>
                <p className="text-sm text-muted-foreground">Urgent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="h-40 rounded-lg bg-muted animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="space-y-4">
              {projects
                .filter((p) => {
                  if (activeTab === 'active') return p.status === 'ACTIVE';
                  if (activeTab === 'completed') return p.status === 'COMPLETED';
                  return true;
                })
                .map((project) => {
                  const completedCount = project.tasks.filter(
                    (t) => t.status === 'DONE'
                  ).length;
                  const progress =
                    project.tasks.length > 0
                      ? (completedCount / project.tasks.length) * 100
                      : 0;

                  return (
                    <Card key={project.id}>
                      <CardHeader className="flex flex-row items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-chart-4/10">
                            <FolderKanban className="h-6 w-6 text-chart-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">
                                {project.name}
                              </CardTitle>
                              <Badge
                                variant="outline"
                                className={getStatusColor(project.status)}
                              >
                                {project.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            {project.description && (
                              <CardDescription className="mt-1 max-w-2xl">
                                {project.description}
                              </CardDescription>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              {project.deadline && (
                                <div className="flex items-center gap-1">
                                  <CalendarClock className="h-4 w-4" />
                                  {format(new Date(project.deadline), 'MMM d, yyyy')}
                                </div>
                              )}
                              {project.budgetAmount && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  {project.budgetAmount.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                  })}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                {project.comments.length} comments
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProject(project);
                              setIsTaskDialogOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Task
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedProject(project);
                                  setSelectedTask(null);
                                  setIsCommentDialogOpen(true);
                                }}
                              >
                                Add Comment
                              </DropdownMenuItem>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                              {completedCount}/{project.tasks.length} tasks
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>

                        {/* Tasks */}
                        {project.tasks.length > 0 ? (
                          <div className="space-y-2">
                            {project.tasks.map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                              >
                                <Checkbox
                                  checked={task.status === 'DONE'}
                                  className="h-5 w-5"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p
                                      className={`font-medium ${
                                        task.status === 'DONE'
                                          ? 'line-through text-muted-foreground'
                                          : ''
                                      }`}
                                    >
                                      {task.title}
                                    </p>
                                    <Badge
                                      className={`text-xs ${getPriorityColor(
                                        task.priority
                                      )}`}
                                    >
                                      {getPriorityIcon(task.priority)}
                                      <span className="ml-1">{task.priority}</span>
                                    </Badge>
                                  </div>
                                  {task.description && (
                                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                                {task.dueDate && (
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    {format(new Date(task.dueDate), 'MMM d')}
                                  </div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setSelectedTask(task);
                                    setIsCommentDialogOpen(true);
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No tasks yet</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                setSelectedProject(project);
                                setIsTaskDialogOpen(true);
                              }}
                            >
                              Add your first task
                            </Button>
                          </div>
                        )}

                        {/* Comments */}
                        {project.comments.length > 0 && (
                          <div className="pt-4 border-t border-border">
                            <h4 className="text-sm font-medium mb-3">
                              Recent Comments
                            </h4>
                            <div className="space-y-3">
                              {project.comments.slice(0, 3).map((comment) => (
                                <div
                                  key={comment.id}
                                  className="flex items-start gap-3"
                                >
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                      {comment.author?.name?.[0] || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">
                                        {comment.author?.name || 'User'}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(
                                          new Date(comment.createdAt),
                                          { addSuffix: true }
                                        )}
                                      </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {comment.body}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16">
                <Empty
                  icon={FolderKanban}
                  title="No projects yet"
                  description="Create your first project to start organizing your work"
                >
                  <Button onClick={() => setIsProjectDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </Empty>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>
              Add a new task to {selectedProject?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTask} className="space-y-4 mt-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="taskTitle">Title</FieldLabel>
                <Input
                  id="taskTitle"
                  placeholder="e.g., Design homepage mockup"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="taskDescription">
                  Description (optional)
                </FieldLabel>
                <Textarea
                  id="taskDescription"
                  placeholder="Add more details..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={2}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="taskDueDate">Due Date (optional)</FieldLabel>
                  <Input
                    id="taskDueDate"
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Priority</FieldLabel>
                  <Select
                    value={taskPriority}
                    onValueChange={(v) => setTaskPriority(v as Task['priority'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </FieldGroup>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Spinner className="mr-2" /> : null}
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Comment Dialog */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogDescription>
              {selectedTask
                ? `Comment on task: ${selectedTask.title}`
                : `Add a comment to ${selectedProject?.name}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddComment} className="space-y-4 mt-4">
            <Field>
              <FieldLabel htmlFor="commentBody">Comment</FieldLabel>
              <Textarea
                id="commentBody"
                placeholder="Write your comment..."
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                rows={4}
                required
              />
            </Field>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Spinner className="mr-2" /> : null}
              {isSubmitting ? 'Adding...' : 'Add Comment'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
