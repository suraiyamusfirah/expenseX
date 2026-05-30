import assert from "node:assert/strict";
import { test } from "node:test";
import { TransactionService } from "./service.js";

class MemoryStore {
  constructor() {
    this.database = { transactions: [] };
  }

  async read() {
    return structuredClone(this.database);
  }

  async write(database) {
    this.database = structuredClone(database);
  }
}

test("creates and summarizes personal transactions", async () => {
  const service = new TransactionService(new MemoryStore());

  await service.create({
    type: "income",
    amount: 3500,
    category: "Salary",
    date: "2026-05-29"
  });
  await service.create({
    type: "expense",
    amount: 25.499,
    category: "Food",
    note: "Lunch",
    date: "2026-05-29"
  });

  const summary = await service.summary();

  assert.equal(summary.income, 3500);
  assert.equal(summary.expense, 25.5);
  assert.equal(summary.balance, 3474.5);
  assert.equal(summary.transactionCount, 2);
});

test("rejects invalid transactions", async () => {
  const service = new TransactionService(new MemoryStore());

  await assert.rejects(
    service.create({
      type: "expense",
      amount: 0,
      category: "Food",
      date: "2026-05-29"
    }),
    /amount must be greater than zero/
  );
});
