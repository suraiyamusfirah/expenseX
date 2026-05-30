import { randomUUID } from "node:crypto";

const transactionTypes = new Set(["income", "expense"]);

export class TransactionService {
  constructor(store) {
    this.store = store;
  }

  async list() {
    const database = await this.store.read();
    return [...database.transactions].sort((a, b) => b.date.localeCompare(a.date));
  }

  async create(input) {
    const transaction = normalizeTransaction(input);
    const database = await this.store.read();

    database.transactions.push({
      id: randomUUID(),
      ...transaction,
      createdAt: new Date().toISOString()
    });

    await this.store.write(database);
    return database.transactions.at(-1);
  }

  async delete(id) {
    const database = await this.store.read();
    const nextTransactions = database.transactions.filter((transaction) => transaction.id !== id);

    if (nextTransactions.length === database.transactions.length) {
      return false;
    }

    await this.store.write({ ...database, transactions: nextTransactions });
    return true;
  }

  async summary() {
    const transactions = await this.list();
    const totals = transactions.reduce(
      (summary, transaction) => {
        if (transaction.type === "income") {
          summary.income += transaction.amount;
        } else {
          summary.expense += transaction.amount;
        }

        summary.byCategory[transaction.category] =
          (summary.byCategory[transaction.category] ?? 0) + signedAmount(transaction);

        return summary;
      },
      { income: 0, expense: 0, byCategory: {} }
    );

    return {
      income: roundCurrency(totals.income),
      expense: roundCurrency(totals.expense),
      balance: roundCurrency(totals.income - totals.expense),
      byCategory: totals.byCategory,
      transactionCount: transactions.length
    };
  }
}

function normalizeTransaction(input) {
  const type = String(input.type ?? "").trim().toLowerCase();
  const amount = Number(input.amount);
  const category = String(input.category ?? "").trim();
  const note = String(input.note ?? "").trim();
  const date = String(input.date ?? "").trim() || new Date().toISOString().slice(0, 10);

  if (!transactionTypes.has(type)) {
    throw validationError("type must be income or expense");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw validationError("amount must be greater than zero");
  }

  if (!category) {
    throw validationError("category is required");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw validationError("date must use YYYY-MM-DD format");
  }

  return {
    type,
    amount: roundCurrency(amount),
    category,
    note,
    date
  };
}

function signedAmount(transaction) {
  return transaction.type === "income" ? transaction.amount : -transaction.amount;
}

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function validationError(message) {
  const error = new Error(message);
  error.name = "ValidationError";
  return error;
}
