'use client';

import { useEffect, useState } from 'react';
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
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import api from '@/lib/api';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';

type PlanItem = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: string;
  isRecurring: boolean;
};

type Plan = {
  id: string;
  type: string;
  title: string;
  description?: string;
  periodStart: string;
  periodEnd: string;
  workspaceId: string;
  items: PlanItem[];
};

export default function PlansPage() {
  const { currentWorkspace } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Plan form state
  const [planTitle, setPlanTitle] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planType, setPlanType] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');

  // Item form state
  const [itemTitle, setItemTitle] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemDueDate, setItemDueDate] = useState('');
  const [itemIsRecurring, setItemIsRecurring] = useState(false);

  const fetchPlans = async () => {
    if (!currentWorkspace) return;

    setIsLoading(true);
    try {
      const response = await api.getPlans();
      if (response.success) {
        setPlans(response.data);
      }
    } catch {
      toast.error('Failed to load plans');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [currentWorkspace]);

  const getPeriodDates = (type: string) => {
    const now = new Date();
    switch (type) {
      case 'DAILY':
        return {
          start: now,
          end: now,
        };
      case 'WEEKLY':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
        };
      case 'MONTHLY':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
      case 'YEARLY':
        return {
          start: startOfYear(now),
          end: endOfYear(now),
        };
      default:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
    }
  };

  const resetPlanForm = () => {
    setPlanTitle('');
    setPlanDescription('');
    setPlanType('MONTHLY');
  };

  const resetItemForm = () => {
    setItemTitle('');
    setItemDescription('');
    setItemDueDate('');
    setItemIsRecurring(false);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { start, end } = getPeriodDates(planType);
      await api.createPlan({
        type: planType,
        title: planTitle,
        description: planDescription || undefined,
        periodStart: start.toISOString(),
        periodEnd: end.toISOString(),
      });

      toast.success('Plan created!');
      setIsPlanDialogOpen(false);
      resetPlanForm();
      fetchPlans();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setIsSubmitting(true);
    try {
      await api.addPlanItem(selectedPlan.id, {
        title: itemTitle,
        description: itemDescription || undefined,
        dueDate: itemDueDate ? new Date(itemDueDate).toISOString() : undefined,
        isRecurring: itemIsRecurring,
      });

      toast.success('Item added!');
      setIsItemDialogOpen(false);
      resetItemForm();
      fetchPlans();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add item');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const filteredPlans = activeTab === 'all'
    ? plans
    : plans.filter((p) => p.type === activeTab.toUpperCase());

  const totalItems = plans.reduce((acc, plan) => acc + plan.items.length, 0);
  const completedItems = plans.reduce(
    (acc, plan) =>
      acc + plan.items.filter((item) => item.status === 'COMPLETED').length,
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
        <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Plan</DialogTitle>
              <DialogDescription>
                Create a new plan to organize your goals and tasks
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePlan} className="space-y-4 mt-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="planTitle">Title</FieldLabel>
                  <Input
                    id="planTitle"
                    placeholder="e.g., April Goals"
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="planDescription">
                    Description (optional)
                  </FieldLabel>
                  <Textarea
                    id="planDescription"
                    placeholder="What do you want to achieve?"
                    value={planDescription}
                    onChange={(e) => setPlanDescription(e.target.value)}
                    rows={2}
                  />
                </Field>
                <Field>
                  <FieldLabel>Plan Type</FieldLabel>
                  <Select value={planType} onValueChange={(v) => setPlanType(v as typeof planType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Spinner className="mr-2" /> : null}
                {isSubmitting ? 'Creating...' : 'Create Plan'}
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
                  (i) => i.status === 'COMPLETED'
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
                                checked={item.status === 'COMPLETED'}
                                className="h-5 w-5"
                              />
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`font-medium ${
                                    item.status === 'COMPLETED'
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
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Plan Item</DialogTitle>
            <DialogDescription>
              Add a new item to {selectedPlan?.title}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddItem} className="space-y-4 mt-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="itemTitle">Title</FieldLabel>
                <Input
                  id="itemTitle"
                  placeholder="e.g., Complete project proposal"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="itemDescription">
                  Description (optional)
                </FieldLabel>
                <Textarea
                  id="itemDescription"
                  placeholder="Add more details..."
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  rows={2}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="itemDueDate">Due Date (optional)</FieldLabel>
                <Input
                  id="itemDueDate"
                  type="date"
                  value={itemDueDate}
                  onChange={(e) => setItemDueDate(e.target.value)}
                />
              </Field>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRecurring"
                  checked={itemIsRecurring}
                  onCheckedChange={(checked) =>
                    setItemIsRecurring(checked as boolean)
                  }
                />
                <label
                  htmlFor="isRecurring"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  This is a recurring item
                </label>
              </div>
            </FieldGroup>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Spinner className="mr-2" /> : null}
              {isSubmitting ? 'Adding...' : 'Add Item'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
