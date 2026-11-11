# Statement Studio (Blu)

A small, client-side web app that turns a Blu Bank statement export (`.xlsx`) into a readable summary: balance over time, spending by category, a searchable transaction table, CSV export, and a shareable summary card.

- Vite + Vue 3 + TypeScript + Pinia + Tailwind CSS v4
- Persian (RTL) interface, Yekan Bakh font
- Files are read in the browser; nothing is uploaded anywhere

## Features

- Load one or more yearly exports. Overlapping rows are de-duplicated, so you can stack exports to go past Blu's one-year limit.
- Enter your current balance. Blu's export only covers a year, so any difference from the last statement balance is treated as the balance carried in from before that year and applied to the whole history.
- Transactions are grouped into categories (shopping, food, transport, bills, cash, transfers, and so on) by keyword matching. The rules are in `src/lib/categories.ts`, and they are a best guess until you tune them to your own statements.
- Export all transactions as CSV (UTF-8 with BOM, opens correctly in Excel).
- Generate a 1080×1350 PNG summary card. Amounts and the category breakdown can each be hidden before sharing.

## Development

```bash
npm install
npm run dev        # local dev server
npm run build      # typecheck + production build
npm test           # unit tests (parser, merge, jalali, categories)
```

## Project layout

```
src/
  lib/          parsing, Jalali dates, categories, analytics, CSV, share card
  stores/       Pinia stores (statement data and balance, UI state)
  components/   Vue components
  assets/       Blu logo and Yekan Bakh font files
```

## Deployment

Pushes to `main` build the app and sync `dist/` to an S3-compatible bucket (Arvan Cloud Object Storage by default), using `.github/workflows/deploy.yml`. Pull requests run typecheck, tests, and build via `.github/workflows/ci.yml`.

Repository settings needed before the first deploy:

| Name | Kind | Purpose |
| --- | --- | --- |
| `AWS_ACCESS_KEY_ID` | secret | Storage access key |
| `AWS_SECRET_ACCESS_KEY` | secret | Storage secret key |
| `MAIN_S3_BUCKET` | secret | Target bucket name |
| `S3_ENDPOINT` | variable (optional) | Defaults to `https://s3.ir-central1.arvanstorage.ir` |

The bucket must be configured for static website hosting with `index.html` as the index and fallback document.

## License

MIT. See [LICENSE](LICENSE).

## Disclaimer

این پروژه غیررسمی است و وابسته به بلوبانک نیست.

This project is independent and is not affiliated with, endorsed by, or sponsored by Blu Bank. "Blu" and the Blu logo belong to Blu Bank. The logo is included only to identify the statements this tool reads.
