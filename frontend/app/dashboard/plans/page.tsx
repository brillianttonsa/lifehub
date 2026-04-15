'use client';

import { useMemo, useState } from 'react';
import {
  Calendar,
  Plus,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Clock,
  CalendarDays,
  CalendarRange,
  LayoutList,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Empty } from '@/components/ui/empty';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { CreatePlanDialog } from '@/components/plans/create-plan-dialog';
import { AddPlanItemDialog } from '@/components/plans/add-plan-item-dialog';
import { usePlans } from '@/hooks/plans/use-plans';
import type { Plan } from '@/types/plans';

export default function PlansPage() {
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const { plans, loading: isLoading, fetchPlans } = usePlans();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DAILY':
        return Clock;
      case 'WEEKLY':
        return CalendarDays;
      case 'MONTHLY':
        return Calendar;
      case 'YEARLY':
        return CalendarRange;
      default:
        return Calendar;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DAILY':
        return 'bg-chart-1/10 text-chart-1';
      case 'WEEKLY':
        return 'bg-chart-2/10 text-chart-2';
      case 'MONTHLY':
        return 'bg-chart-3/10 text-chart-3';
      case 'YEARLY':
        return 'bg-chart-4/10 text-chart-4';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  const filteredPlans = useMemo(
    () => (activeTab === 'all' ? plans : plans.filter((p) => p.type === activeTab.toUpperCase())),
    [activeTab, plans],
  );

  const totalItems = plans.reduce((acc, plan) => acc + plan.items.length, 0);
  const completedItems = plans.reduce(
    (acc, plan) =>
      acc + plan.items.filter((item) => item.status === 'DONE' || item.status === 'COMPLETED').length,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Plans</h1>
          <p className="text-muted-foreground mt-1">
            Organize your goals with daily, weekly, monthly, and yearly plans
          </p>
        </div>
        <CreatePlanDialog onSuccess={fetchPlans} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <LayoutList className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{plans.length}</p>
                <p className="text-sm text-muted-foreground">Total Plans</p>
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
                <p className="text-2xl font-bold">{totalItems}</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
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
                <p className="text-2xl font-bold">{completedItems}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-chart-3/10">
                <Calendar className="h-6 w-6 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalItems > 0
                    ? Math.round((completedItems / totalItems) * 100)
                    : 0}
                  %
                </p>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="h-32 rounded-lg bg-muted animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPlans.length > 0 ? (
            <div className="space-y-4">
              {filteredPlans.map((plan) => {
                const TypeIcon = getTypeIcon(plan.type);
                const typeColor = getTypeColor(plan.type);
                const completed = plan.items.filter(
                  (i) => i.status === 'DONE' || i.status === 'COMPLETED'
                ).length;
                const progress =
                  plan.items.length > 0
                    ? (completed / plan.items.length) * 100
                    : 0;

                return (
                  <Card key={plan.id}>
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${typeColor}`}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {plan.title}
                            <Badge variant="outline" className="font-normal capitalize">
                              {plan.type.toLowerCase()}
                            </Badge>
                          </CardTitle>
                          {plan.description && (
                            <CardDescription className="mt-1">
                              {plan.description}
                            </CardDescription>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(plan.periodStart), 'MMM d')} -{' '}
                            {format(new Date(plan.periodEnd), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPlan(plan);
                            setIsItemDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Item
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {plan.items.length > 0 ? (
                        <div className="space-y-3">
                          {plan.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                            >
                              <Checkbox
                                checked={item.status === 'DONE' || item.status === 'COMPLETED'}
                                className="h-5 w-5"
                              />
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`font-medium ${
                                    item.status === 'DONE' || item.status === 'COMPLETED'
                                      ? 'line-through text-muted-foreground'
                                      : ''
                                  }`}
                                >
                                  {item.title}
                                </p>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground truncate">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              {item.dueDate && (
                                <Badge variant="secondary" className="shrink-0">
                                  {format(new Date(item.dueDate), 'MMM d')}
                                </Badge>
                              )}
                              {item.isRecurring && (
                                <Badge variant="outline" className="shrink-0">
                                  Recurring
                                </Badge>
                              )}
                            </div>
                          ))}
                          <div className="pt-4 border-t border-border">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-muted-foreground">
                                Progress
                              </span>
                              <span className="font-medium">
                                {completed}/{plan.items.length} completed
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No items yet</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              setSelectedPlan(plan);
                              setIsItemDialogOpen(true);
                            }}
                          >
                            Add your first item
                          </Button>
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
                  icon={Calendar}
                  title="No plans yet"
                  description="Create your first plan to start organizing your goals"
                >
                  <Button onClick={() => setIsPlanDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Plan
                  </Button>
                </Empty>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <AddPlanItemDialog
        open={isItemDialogOpen}
        onOpenChange={setIsItemDialogOpen}
        plan={selectedPlan}
        onSuccess={fetchPlans}
      />
    </div>
  );
}
