# ExpenseX

ExpenseX is a Node.js monolith for personal money tracking. It includes a small HTTP API, file-backed JSON storage, and a browser dashboard for income, expenses, and monthly balance.

## Requirements

- Node.js 20 or newer

## Run

```sh
npm start
```

For development with automatic restarts:

```sh
npm run dev
```

<!-- Open `http://localhost:3000`.

## Test

```sh
npm test
```

## API

- `GET /api/health`
- `GET /api/transactions`
- `POST /api/transactions`
- `DELETE /api/transactions/:id`
- `GET /api/summary`

Example:

```sh
curl -X POST http://localhost:3000/api/transactions \
  -H 'Content-Type: application/json' \
  -d '{"type":"expense","amount":14.5,"category":"Food","note":"Lunch","date":"2026-05-29"}' -->
```
