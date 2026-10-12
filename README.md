# Longview

Longview is a local demo of an investment research workspace for a long-term value fund. It follows an idea from discovery through screening, research, valuation, a watchlist, and an investment committee.

The demo workspace is **Longview Capital — Demo**. Every company, person, document, and figure is fictional. Prices are illustrative discussion numbers, not live market data and not investment recommendations.

The app runs entirely in the browser. Research edits are stored in `localStorage`. There is no account, no database, and no market-data or AI subscription.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The home page redirects to the overview.

Other useful commands:

```bash
npm run typecheck
npm run lint
npm run verify
npm run build
npm start
```

`npm run verify` checks that dashboard counts, margin of safety, and the demo dataset stay consistent.

## What to click first

1. Overview — counts, attention items, and the committee calendar.
2. Idea Pipeline — filter the board, open a company, or create an idea.
3. Vossfjord Marine — a company workspace with a thesis, valuation, questions, and history.
4. Investment Committee — the next session opens with a sample dossier.
5. Settings — export JSON or CSV, or reset the demo data.

## Deploy to Vercel

This repository is a standard Next.js app. It does not need environment variables.

1. Push the project to a Git host.
2. In Vercel, import the repository.
3. Leave the framework preset as Next.js. Build command: `npm run build`. Output: the Next.js default.
4. Do not add API keys. Deploy.

The app is not deployed from this repository by itself. A public URL exists only after someone completes that import.

## Notes

- Resetting demo data in Settings replaces browser changes with the original fictional dataset.
- Currency choices other than EUR are fixed illustrative display rates, not foreign-exchange quotes.
- “Acting as” only labels history in the demo. It is not access control.
- The research assistant compares and summarises data already stored in the workspace. It does not call a model or a data vendor.
