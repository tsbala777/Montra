
export type TransactionType = 'income' | 'expense';

export enum Category {
  FOOD = 'Food',
  TRAVEL = 'Travel',
  RENT = 'Rent',
  UTILITIES = 'Utilities',
  SUBSCRIPTIONS = 'Subscriptions',
  ENTERTAINMENT = 'Entertainment',
  ACADEMICS = 'Academics',
  SHOPPING = 'Shopping',
  GROCERIES = 'Groceries',
  TRANSPORTATION = 'Transportation',
  PERSONAL_CARE = 'Personal Care',
  OTHER = 'Other',
  INCOME = 'Income',
  INCOME_SOURCE = 'Income Source',
  SCHOLARSHIP = 'Scholarship',
  GIFT = 'Gift'
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: Category | string;
  date: string;
  type: TransactionType;
  source?: string;
  wallet?: 'cash' | 'card' | 'bank' | 'upi';
  tags?: string[];
}

export interface Budget {
  category: Category | string;
  limit: number;
}

export const PRESET_GOAL_ICONS = [
  'target', 'travel', 'tech', 'car', 'home', 'education', 'music', 'fashion',
  'phone', 'camera', 'bike', 'food', 'gift', 'savings', 'vacation', 'sport',
  'watch', 'game', 'jewelry', 'pet', 'art', 'camping', 'work'
] as const;

export type GoalIcon = typeof PRESET_GOAL_ICONS[number] | string;

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: GoalIcon;
  deadline?: string; // ISO Date String
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  cardLastFour?: string;
}

export interface UserSettings {
  currency: string;
  language: string;
  theme: 'vibrant' | 'minimalist';
  isDarkMode: boolean;
  profile: UserProfile;
  investmentAmount: number;
  investments: Investment[];
}

// Investment Types
export type InvestmentType = 'stocks' | 'mutual_funds' | 'gold' | 'crypto' | 'fixed_deposit' | 'real_estate' | 'other';

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  symbol?: string;
  purchasePrice: number;
  currentValue: number;
  quantity: number;
  purchaseDate: string;
  notes?: string;
}

export interface InvestmentTransaction {
  id: string;
  investmentId: string;
  type: 'buy' | 'sell' | 'dividend';
  amount: number;
  quantity?: number;
  date: string;
  notes?: string;
}

export interface AppState {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  settings: UserSettings;
}

export type View = 'dashboard' | 'transactions' | 'budgets' | 'goals' | 'analytics' | 'settings' | 'login' | 'signup';
