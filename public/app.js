const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

const form = document.querySelector("#transaction-form");
const statusEl = document.querySelector("#status");
const listEl = document.querySelector("#transaction-list");
const countEl = document.querySelector("#transaction-count");
const incomeEl = document.querySelector("#income");
const expenseEl = document.querySelector("#expense");
const balanceEl = document.querySelector("#balance");

form.elements.date.value = new Date().toISOString().slice(0, 10);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);

  const transaction = {
    type: formData.get("type"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    note: formData.get("note"),
    date: formData.get("date")
  };

  await request("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction)
  });

  form.reset();
  form.elements.type.value = "expense";
  form.elements.date.value = new Date().toISOString().slice(0, 10);
  await refresh();
});

listEl.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-id]");
  if (!button) {
    return;
  }

  await request(`/api/transactions/${button.dataset.deleteId}`, {
    method: "DELETE"
  });
  await refresh();
});

async function refresh() {
  setStatus("Loading");
  const [transactions, summary] = await Promise.all([
    request("/api/transactions"),
    request("/api/summary")
  ]);

  renderSummary(summary);
  renderTransactions(transactions);
  setStatus("Ready");
}

function renderSummary(summary) {
  incomeEl.textContent = currency.format(summary.income);
  expenseEl.textContent = currency.format(summary.expense);
  balanceEl.textContent = currency.format(summary.balance);
}

function renderTransactions(transactions) {
  countEl.textContent = `${transactions.length} ${transactions.length === 1 ? "item" : "items"}`;

  if (transactions.length === 0) {
    listEl.innerHTML = '<div class="empty">No transactions yet.</div>';
    return;
  }

  listEl.replaceChildren(
    ...transactions.map((transaction) => {
      const row = document.createElement("article");
      row.className = "transaction";

      const title = document.createElement("div");
      title.className = "transaction-title";
      title.innerHTML = `<strong></strong><span></span>`;
      title.querySelector("strong").textContent = transaction.category;
      title.querySelector("span").textContent = [transaction.date, transaction.note]
        .filter(Boolean)
        .join(" · ");

      const amount = document.createElement("div");
      amount.className = `amount ${transaction.type}`;
      amount.textContent = `${transaction.type === "income" ? "+" : "-"}${currency.format(transaction.amount)}`;

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-button";
      deleteButton.type = "button";
      deleteButton.dataset.deleteId = transaction.id;
      deleteButton.setAttribute("aria-label", "Delete transaction");
      deleteButton.textContent = "x";

      row.append(title, amount, deleteButton);
      return row;
    })
  );
}

async function request(path, options) {
  const response = await fetch(path, options);
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "Request failed");
  }

  return body;
}

function setStatus(message) {
  statusEl.textContent = message;
}

refresh().catch((error) => {
  console.error(error);
  setStatus(error.message);
});
