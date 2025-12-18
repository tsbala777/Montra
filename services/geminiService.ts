
import { GoogleGenAI } from "@google/genai";
import { Transaction, Budget, SavingsGoal, UserProfile, Category } from "../types";

// Always initialize GoogleGenAI with a named parameter using process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getFinancialInsight = async (
  transactions: Transaction[],
  budgets: Budget[],
  goals: SavingsGoal[],
  profile: UserProfile
): Promise<string> => {
  if (transactions.length === 0) {
    return "Start adding transactions to unlock AI-powered insights about your money.";
  }

  // 1. Calculate Budget Adherence for Current Month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const spendingByCategory: Record<string, number> = {};
  transactions.forEach(t => {
    const d = new Date(t.date);
    if (t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
    }
  });

  const budgetAnalysis = budgets.map(b => ({
    category: b.category,
    limit: b.limit,
    spent: spendingByCategory[b.category] || 0,
    status: (spendingByCategory[b.category] || 0) > b.limit ? 'OVER_BUDGET' : 'ON_TRACK'
  }));

  // 2. Prepare Data Payload
  // We send a summary of the financial state to save tokens and improve context
  const recentTransactions = transactions.slice(0, 30).map(t => ({
    a: t.amount,
    c: t.category,
    d: t.description,
    t: t.date.split('T')[0]
  }));

  const goalsProgress = goals.map(g => ({
    name: g.name,
    target: g.targetAmount,
    current: g.currentAmount,
    percent: Math.round((g.currentAmount / g.targetAmount) * 100)
  }));

  try {
    // Using gemini-3-flash-preview for sophisticated text reasoning
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Act as a witty, supportive, Gen-Z financial "bestie" for a college student named ${profile.name || 'Student'} at ${profile.school || 'College'}.
        
        Analyze this financial snapshot:
        
        1. **Budgets (Current Month):** 
           ${JSON.stringify(budgetAnalysis)}
        
        2. **Savings Goals:** 
           ${JSON.stringify(goalsProgress)}
        
        3. **Recent Transactions (Last 30 items):** 
           ${JSON.stringify(recentTransactions)}

        **Task:**
        Provide a SINGLE, 1-sentence insight or nudge. 
        
        **Priorities (Pick ONE interesting thing):**
        - If a budget is exceeded (status: OVER_BUDGET), gently roast them about it.
        - If they spent money on "Coffee" or "Food" frequently, comment on it.
        - If they are close to a savings goal, cheer them on.
        - If they are doing great, give a high five.
        
        **Tone:** Use slang lightly (slay, bet, oof, cooked), use 1-2 emojis. Be concise. No markdown.
      `,
    });

    return response.text || "Keep tracking to see more insights!";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Brainstorming new money moves for you... check back later! 🌟";
  }
};
