'use client';

import { useState } from 'react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'sonner';
import api from '@/lib/api';
import { format } from 'date-fns';

type Wallet = {
  id: string;
  name: string;
  type: 'CASH' | 'BANK' | 'CREDIT' | 'EWALLET';
  provider?: string;
  balance: number;
};

type Transaction = {
  id: string;
  kind: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  description?: string;
  category?: string;
  occurredAt: string;
  sourceWallet?: Wallet;
  destinationWallet?: Wallet;
};

// Mock data for demo
const mockWallets: Wallet[] = [
  { id: '1', name: 'Main Wallet', type: 'CASH', balance: 1250.00 },
  { id: '2', name: 'Bank Account', type: 'BANK', provider: 'Chase', balance: 5840.50 },
  { id: '3', name: 'Credit Card', type: 'CREDIT', provider: 'Visa', balance: -320.00 },
  { id: '4', name: 'PayPal', type: 'EWALLET', provider: 'PayPal', balance: 180.25 },
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    kind: 'INCOME',
    amount: 3500,
    description: 'Monthly Salary',
    category: 'Salary',
    occurredAt: new Date().toISOString(),
    destinationWallet: mockWallets[1],
  },
  {
    id: '2',
    kind: 'EXPENSE',
    amount: 85.50,
    description: 'Grocery Shopping',
    category: 'Food',
    occurredAt: new Date(Date.now() - 86400000).toISOString(),
    sourceWallet: mockWallets[0],
  },
  {
    id: '3',
    kind: 'EXPENSE',
    amount: 45.00,
    description: 'Uber Rides',
    category: 'Transport',
    occurredAt: new Date(Date.now() - 172800000).toISOString(),
    sourceWallet: mockWallets[0],
  },
  {
    id: '4',
    kind: 'TRANSFER',
    amount: 200,
    description: 'Transfer to savings',
    occurredAt: new Date(Date.now() - 259200000).toISOString(),
    sourceWallet: mockWallets[1],
    destinationWallet: mockWallets[0],
  },
];

export default function PocketPage() {
  const [wallets, setWallets] = useState<Wallet[]>(mockWallets);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Wallet form state
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState<'CASH' | 'BANK' | 'CREDIT' | 'EWALLET'>('CASH');
  const [walletProvider, setWalletProvider] = useState('');

  // Transaction form state
  const [transactionKind, setTransactionKind] = useState<'INCOME' | 'EXPENSE' | 'TRANSFER'>('EXPENSE');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionDescription, setTransactionDescription] = useState('');
  const [transactionCategory, setTransactionCategory] = useState('');
  const [sourceWalletId, setSourceWalletId] = useState('');
  const [destinationWalletId, setDestinationWalletId] = useState('');

  const resetWalletForm = () => {
    setWalletName('');
    setWalletType('CASH');
    setWalletProvider('');
  };

  const resetTransactionForm = () => {
    setTransactionKind('EXPENSE');
    setTransactionAmount('');
    setTransactionDescription('');
    setTransactionCategory('');
    setSourceWalletId('');
    setDestinationWalletId('');
  };

  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.createWallet({
        name: walletName,
        type: walletType,
        provider: walletProvider || undefined,
      });

      if (response.success) {
        setWallets([...wallets, { ...response.data, balance: 0 }]);
        toast.success('Wallet created!');
        setIsWalletDialogOpen(false);
        resetWalletForm();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create wallet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data: Parameters<typeof api.createTransaction>[0] = {
        kind: transactionKind,
        amount: parseFloat(transactionAmount),
        occurredAt: new Date().toISOString(),
        description: transactionDescription || undefined,
        category: transactionCategory || undefined,
      };

      if (transactionKind === 'EXPENSE' || transactionKind === 'TRANSFER') {
        data.sourceWalletId = sourceWalletId;
      }
      if (transactionKind === 'INCOME' || transactionKind === 'TRANSFER') {
        data.destinationWalletId = destinationWalletId;
      }

      const response = await api.createTransaction(data);

      if (response.success) {
        const newTransaction: Transaction = {
          id: response.data.id,
          kind: response.data.kind as Transaction['kind'],
          amount: response.data.amount,
          description: transactionDescription,
          category: transactionCategory,
          occurredAt: new Date().toISOString(),
          sourceWallet: wallets.find((w) => w.id === sourceWalletId),
          destinationWallet: wallets.find((w) => w.id === destinationWalletId),
        };
        setTransactions([newTransaction, ...transactions]);
        toast.success('Transaction recorded!');
        setIsTransactionDialogOpen(false);
        resetTransactionForm();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'CASH':
        return Banknote;
      case 'BANK':
        return Building2;
      case 'CREDIT':
        return CreditCard;
      case 'EWALLET':
        return Smartphone;
      default:
        return Wallet;
    }
  };

  const getWalletColor = (type: string) => {
    switch (type) {
      case 'CASH':
        return 'bg-chart-3/10 text-chart-3';
      case 'BANK':
        return 'bg-chart-2/10 text-chart-2';
      case 'CREDIT':
        return 'bg-chart-4/10 text-chart-4';
      case 'EWALLET':
        return 'bg-chart-1/10 text-chart-1';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  const getTransactionIcon = (kind: string) => {
    switch (kind) {
      case 'INCOME':
        return ArrowDownLeft;
      case 'EXPENSE':
        return ArrowUpRight;
      case 'TRANSFER':
        return ArrowLeftRight;
      default:
        return ArrowUpRight;
    }
  };

  const getTransactionColor = (kind: string) => {
    switch (kind) {
      case 'INCOME':
        return 'text-success bg-success/10';
      case 'EXPENSE':
        return 'text-destructive bg-destructive/10';
      case 'TRANSFER':
        return 'text-chart-2 bg-chart-2/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);
  const totalIncome = transactions
    .filter((t) => t.kind === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.kind === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

  const categories = [
    'Food',
    'Transport',
    'Entertainment',
    'Shopping',
    'Bills',
    'Health',
    'Education',
    'Salary',
    'Other',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pocket</h1>
          <p className="text-muted-foreground mt-1">
            Track your finances across all your wallets
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Wallet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Wallet</DialogTitle>
                <DialogDescription>
                  Add a new wallet to track your finances
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateWallet} className="space-y-4 mt-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="walletName">Name</FieldLabel>
                    <Input
                      id="walletName"
                      placeholder="e.g., Main Wallet"
                      value={walletName}
                      onChange={(e) => setWalletName(e.target.value)}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Type</FieldLabel>
                    <Select
                      value={walletType}
                      onValueChange={(v) => setWalletType(v as typeof walletType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="BANK">Bank Account</SelectItem>
                        <SelectItem value="CREDIT">Credit Card</SelectItem>
                        <SelectItem value="EWALLET">E-Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="walletProvider">
                      Provider (optional)
                    </FieldLabel>
                    <Input
                      id="walletProvider"
                      placeholder="e.g., Chase, PayPal"
                      value={walletProvider}
                      onChange={(e) => setWalletProvider(e.target.value)}
                    />
                  </Field>
                </FieldGroup>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Spinner className="mr-2" /> : null}
                  {isSubmitting ? 'Creating...' : 'Create Wallet'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isTransactionDialogOpen}
            onOpenChange={setIsTransactionDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Transaction</DialogTitle>
                <DialogDescription>
                  Add a new income, expense, or transfer
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTransaction} className="space-y-4 mt-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Type</FieldLabel>
                    <Select
                      value={transactionKind}
                      onValueChange={(v) =>
                        setTransactionKind(v as typeof transactionKind)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INCOME">Income</SelectItem>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="TRANSFER">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="amount">Amount</FieldLabel>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={transactionAmount}
                      onChange={(e) => setTransactionAmount(e.target.value)}
                      required
                    />
                  </Field>
                  {(transactionKind === 'EXPENSE' ||
                    transactionKind === 'TRANSFER') && (
                    <Field>
                      <FieldLabel>From Wallet</FieldLabel>
                      <Select
                        value={sourceWalletId}
                        onValueChange={setSourceWalletId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select wallet" />
                        </SelectTrigger>
                        <SelectContent>
                          {wallets.map((wallet) => (
                            <SelectItem key={wallet.id} value={wallet.id}>
                              {wallet.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                  {(transactionKind === 'INCOME' ||
                    transactionKind === 'TRANSFER') && (
                    <Field>
                      <FieldLabel>To Wallet</FieldLabel>
                      <Select
                        value={destinationWalletId}
                        onValueChange={setDestinationWalletId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select wallet" />
                        </SelectTrigger>
                        <SelectContent>
                          {wallets.map((wallet) => (
                            <SelectItem key={wallet.id} value={wallet.id}>
                              {wallet.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                  <Field>
                    <FieldLabel>Category</FieldLabel>
                    <Select
                      value={transactionCategory}
                      onValueChange={setTransactionCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="description">
                      Description (optional)
                    </FieldLabel>
                    <Textarea
                      id="description"
                      placeholder="Add notes..."
                      value={transactionDescription}
                      onChange={(e) => setTransactionDescription(e.target.value)}
                      rows={2}
                    />
                  </Field>
                </FieldGroup>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Spinner className="mr-2" /> : null}
                  {isSubmitting ? 'Recording...' : 'Record Transaction'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-3xl font-bold mt-1">
                  ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Across {wallets.length} wallets
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-primary/10">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">
                  +${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Income</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-destructive/10">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">
                  -${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Expenses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Wallets Overview */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Your Wallets</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {wallets.map((wallet) => {
                const WalletIcon = getWalletIcon(wallet.type);
                const walletColor = getWalletColor(wallet.type);

                return (
                  <Card key={wallet.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className={`p-2 rounded-lg ${walletColor}`}>
                          <WalletIcon className="h-5 w-5" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
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
                      <div className="mt-4">
                        <p className="font-medium">{wallet.name}</p>
                        {wallet.provider && (
                          <p className="text-xs text-muted-foreground">
                            {wallet.provider}
                          </p>
                        )}
                        <p
                          className={`text-xl font-bold mt-2 ${
                            wallet.balance < 0 ? 'text-destructive' : ''
                          }`}
                        >
                          ${wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
            <Card>
              <CardContent className="pt-6">
                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction) => {
                      const TransactionIcon = getTransactionIcon(transaction.kind);
                      const transactionColor = getTransactionColor(transaction.kind);

                      return (
                        <div
                          key={transaction.id}
                          className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className={`p-2 rounded-lg ${transactionColor}`}>
                            <TransactionIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {transaction.description || transaction.kind}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {transaction.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {transaction.category}
                                </Badge>
                              )}
                              <span>
                                {format(
                                  new Date(transaction.occurredAt),
                                  'MMM d, yyyy'
                                )}
                              </span>
                            </div>
                          </div>
                          <p
                            className={`font-semibold ${
                              transaction.kind === 'INCOME'
                                ? 'text-success'
                                : transaction.kind === 'EXPENSE'
                                ? 'text-destructive'
                                : ''
                            }`}
                          >
                            {transaction.kind === 'INCOME' ? '+' : '-'}$
                            {transaction.amount.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Empty
                    icon={Wallet}
                    title="No transactions yet"
                    description="Start tracking your finances by adding a transaction"
                  >
                    <Button onClick={() => setIsTransactionDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Transaction
                    </Button>
                  </Empty>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wallets" className="mt-6">
          {wallets.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {wallets.map((wallet) => {
                const WalletIcon = getWalletIcon(wallet.type);
                const walletColor = getWalletColor(wallet.type);

                return (
                  <Card key={wallet.id}>
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${walletColor}`}>
                          <WalletIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{wallet.name}</CardTitle>
                          <CardDescription className="capitalize">
                            {wallet.type.toLowerCase()}
                            {wallet.provider && ` - ${wallet.provider}`}
                          </CardDescription>
                        </div>
                      </div>
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
                    </CardHeader>
                    <CardContent>
                      <p
                        className={`text-3xl font-bold ${
                          wallet.balance < 0 ? 'text-destructive' : ''
                        }`}
                      >
                        ${wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Current balance
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16">
                <Empty
                  icon={Wallet}
                  title="No wallets yet"
                  description="Create your first wallet to start tracking your finances"
                >
                  <Button onClick={() => setIsWalletDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Wallet
                  </Button>
                </Empty>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => {
                    const TransactionIcon = getTransactionIcon(transaction.kind);
                    const transactionColor = getTransactionColor(transaction.kind);

                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className={`p-3 rounded-xl ${transactionColor}`}>
                          <TransactionIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">
                            {transaction.description || transaction.kind}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {transaction.category && (
                              <Badge variant="secondary">
                                {transaction.category}
                              </Badge>
                            )}
                            {transaction.sourceWallet && (
                              <span className="text-sm text-muted-foreground">
                                From: {transaction.sourceWallet.name}
                              </span>
                            )}
                            {transaction.destinationWallet && (
                              <span className="text-sm text-muted-foreground">
                                To: {transaction.destinationWallet.name}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(
                              new Date(transaction.occurredAt),
                              'MMMM d, yyyy h:mm a'
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-xl font-bold ${
                              transaction.kind === 'INCOME'
                                ? 'text-success'
                                : transaction.kind === 'EXPENSE'
                                ? 'text-destructive'
                                : ''
                            }`}
                          >
                            {transaction.kind === 'INCOME' ? '+' : '-'}$
                            {transaction.amount.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
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
                    );
                  })}
                </div>
              ) : (
                <Empty
                  icon={Wallet}
                  title="No transactions yet"
                  description="Start tracking your finances by adding a transaction"
                >
                  <Button onClick={() => setIsTransactionDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </Empty>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
