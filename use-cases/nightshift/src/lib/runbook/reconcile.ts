import { booksCsv, portalCsv, PORTAL_INVOICES, BOOKS_ENTRIES } from "../portal/data";
import type { ReconcileRow } from "../types";

export function reconcileInvoices(): ReconcileRow[] {
  const booksMap = new Map(BOOKS_ENTRIES.map((b) => [b.invoiceId, b]));
  const rows: ReconcileRow[] = [];

  for (const inv of PORTAL_INVOICES) {
    const book = booksMap.get(inv.id);
    if (!book) {
      rows.push({
        invoiceId: inv.id,
        vendor: inv.vendor,
        portalAmount: inv.amount,
        booksAmount: 0,
        status: "missing",
      });
      continue;
    }
    const matched = Math.abs(book.amount - inv.amount) < 0.01;
    rows.push({
      invoiceId: inv.id,
      vendor: inv.vendor,
      portalAmount: inv.amount,
      booksAmount: book.amount,
      status: matched ? "matched" : "mismatch",
    });
  }
  return rows;
}

export function reconcilePythonScript(): string {
  const portal = JSON.stringify(PORTAL_INVOICES);
  const books = JSON.stringify(BOOKS_ENTRIES);
  return `
import json
portal = ${portal}
books = ${books}
books_map = {b['invoiceId']: b for b in books}
rows = []
for inv in portal:
    book = books_map.get(inv['id'])
    if not book:
        rows.append({'invoiceId': inv['id'], 'vendor': inv['vendor'], 'portalAmount': inv['amount'], 'booksAmount': 0, 'status': 'missing'})
        continue
    matched = abs(book['amount'] - inv['amount']) < 0.01
    rows.append({'invoiceId': inv['id'], 'vendor': inv['vendor'], 'portalAmount': inv['amount'], 'booksAmount': book['amount'], 'status': 'matched' if matched else 'mismatch'})
mismatches = [r for r in rows if r['status'] != 'matched']
print(json.dumps({'rows': rows, 'mismatchCount': len(mismatches), 'totalPortal': sum(r['portalAmount'] for r in rows)}))
`.trim();
}

export function chartPythonScript(): string {
  return `
import json, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
rows = json.loads(open('/tmp/reconcile.json').read())['rows']
matched = sum(1 for r in rows if r['status']=='matched')
mismatch = sum(1 for r in rows if r['status']=='mismatch')
missing = sum(1 for r in rows if r['status']=='missing')
plt.figure(figsize=(6,4))
plt.bar(['Matched','Mismatch','Missing'], [matched, mismatch, missing], color=['#2d6a4f','#bc4749','#6c757d'])
plt.title('AP Close Exceptions')
plt.ylabel('Invoice count')
plt.tight_layout()
plt.savefig('/tmp/exceptions.png')
print(json.dumps({'matched': matched, 'mismatch': mismatch, 'missing': missing}))
`.trim();
}

export function journalCsv(rows: ReconcileRow[]): string {
  const header = "invoice_id,vendor,portal_amount,books_amount,status";
  const body = rows.map(
    (r) =>
      `${r.invoiceId},${r.vendor},${r.portalAmount.toFixed(2)},${r.booksAmount.toFixed(2)},${r.status}`,
  );
  return [header, ...body].join("\n");
}

export { booksCsv, portalCsv };
