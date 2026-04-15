'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Target,
  Calendar,
  Wallet,
  FolderKanban,
  ArrowRight,
  CheckCircle2,
  Circle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';

type HabitSet = {
  id: string;
  title: string;
  habits: Array<{
    id: string;
    name: string;
    targetCountPerDay: number;
  }>;
};

type Plan = {
  id: string;
  title: string;
  type: string;
  items: Array<{
    id: string;
    title: string;
    status: string;
  }>;
};

type Project = {
  id: string;
  name: string;
  status: string;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
  }>;
};

export default function DashboardPage() {
  const { currentWorkspace } = useAuth();
  const [habitSets, setHabitSets] = useState<HabitSet[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentWorkspace) return;

      setIsLoading(true);
      try {
        const [habitsRes, plansRes, projectsRes] = await Promise.all([
          api.getHabitSets().catch(() => ({ data: [] })),
          api.getPlans().catch(() => ({ data: [] })),
          api.getProjects().catch(() => ({ data: [] })),
        ]);

        setHabitSets(habitsRes.data || []);
        setPlans(plansRes.data || []);
        setProjects(projectsRes.data || []);
      } catch {
        // Handle error silently
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentWorkspace]);

  const totalHabits = habitSets.reduce((acc, set) => acc + set.habits.length, 0);
  const totalPlanItems = plans.reduce((acc, plan) => acc + plan.items.length, 0);
  const completedPlanItems = plans.reduce(
    (acc, plan) =>
      acc + plan.items.filter((item) => item.status === 'COMPLETED').length,
    0
  );
  const totalTasks = projects.reduce((acc, project) => acc + project.tasks.length, 0);
  const completedTasks = projects.reduce(
    (acc, project) =>
      acc + project.tasks.filter((task) => task.status === 'DONE').length,
    0
  );

  const statsCards = [
    {
      title: 'Active Habits',
      value: totalHabits,
      description: `${habitSets.length} habit sets`,
      icon: Target,
      href: '/dashboard/habits',
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
    },
    {
      title: 'Plan Progress',
      value: `${completedPlanItems}/${totalPlanItems}`,
      description: `${plans.length} active plans`,
      icon: Calendar,
      href: '/dashboard/plans',
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
    {
      title: 'Balance',
      value: '$0.00',
      description: 'Across all wallets',
      icon: Wallet,
      href: '/dashboard/pocket',
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
      trend: 'up',
    },
    {
      title: 'Tasks',
      value: `${completedTasks}/${totalTasks}`,
      description: `${projects.length} projects`,
      icon: FolderKanban,
      href: '/dashboard/projects',
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s an overview of your progress.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.trend && (
                    <span
                      className={`flex items-center text-xs ${
                        stat.trend === 'up' ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-0.5" />
                      )}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Habits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Habits</CardTitle>
              <CardDescription>Your latest habit sets</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/habits">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-lg bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : habitSets.length > 0 ? (
              <div className="space-y-4">
                {habitSets.slice(0, 3).map((set) => (
                  <div
                    key={set.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-chart-1/10">
                      <Target className="h-5 w-5 text-chart-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{set.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {set.habits.length} habits
                      </p>
                    </div>
                    <Progress value={Math.random() * 100} className="w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No habits yet</p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href="/dashboard/habits">Create your first habit</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Active Projects</CardTitle>
              <CardDescription>Your current projects</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/projects">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-lg bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : projects.length > 0 ? (
              <div className="space-y-4">
                {projects.slice(0, 3).map((project) => {
                  const progress =
                    project.tasks.length > 0
                      ? (project.tasks.filter((t) => t.status === 'DONE').length /
                          project.tasks.length) *
                        100
                      : 0;
                  return (
                    <div
                      key={project.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-chart-4/10">
                        <FolderKanban className="h-5 w-5 text-chart-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {project.tasks.length} tasks
                        </p>
                      </div>
                      <Progress value={progress} className="w-20" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No projects yet</p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href="/dashboard/projects">Create your first project</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Plan Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
            <CardDescription>
              Your plan items and project tasks due soon
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/plans">
              View plans
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-12 rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : plans.length > 0 || projects.length > 0 ? (
            <div className="space-y-3">
              {plans
                .flatMap((plan) =>
                  plan.items.slice(0, 2).map((item) => ({
                    ...item,
                    planTitle: plan.title,
                    type: 'plan' as const,
                  }))
                )
                .slice(0, 4)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    {item.status === 'COMPLETED' ? (
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium truncate ${
                          item.status === 'COMPLETED'
                            ? 'line-through text-muted-foreground'
                            : ''
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.planTitle}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      Plan Item
                    </Badge>
                  </div>
                ))}
              {projects
                .flatMap((project) =>
                  project.tasks.slice(0, 2).map((task) => ({
                    ...task,
                    projectName: project.name,
                    type: 'task' as const,
                  }))
                )
                .slice(0, 4)
                .map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    {task.status === 'DONE' ? (
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium truncate ${
                          task.status === 'DONE'
                            ? 'line-through text-muted-foreground'
                            : ''
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {task.projectName}
                      </p>
                    </div>
                    <Badge
                      variant={
                        task.priority === 'HIGH' || task.priority === 'URGENT'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="shrink-0"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No upcoming tasks or plan items
              </p>
              <div className="flex justify-center gap-2 mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/plans">Create a plan</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/projects">Add a project</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
