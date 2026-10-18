# AppsDev API Tutorial

A TypeScript and Express.js API starter for AppsDev students.

## Getting started

```bash
npm install
npm run dev
```

Before starting the server, copy `.env.example` to `.env`. In PowerShell, run:

```powershell
Copy-Item .env.example .env
```

The API runs at `http://localhost:7000` by default.

## Test the API

In Postman, send a `GET` request to:

```text
http://localhost:7000/api/health
```

## Useful commands

```bash
npm run dev
npm run lint
npm run build
npm start
```

See the [setup tutorial](docs/expressjs-api-setup-tutorial.md) for the full project walkthrough.
