export type PortalInvoice = {
  id: string;
  vendor: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  status: "pending" | "received";
  lineItems: { description: string; qty: number; unit: number }[];
};

export type BooksEntry = {
  invoiceId: string;
  vendor: string;
  amount: number;
};

export const PORTAL_CREDENTIALS = {
  username: "nightshift",
  password: "close2026",
};

export const PORTAL_INVOICES: PortalInvoice[] = [
  {
    id: "inv-001",
    vendor: "Northwind Supplies",
    invoiceNumber: "NW-88421",
    date: "2026-08-25",
    dueDate: "2026-09-10",
    amount: 1240.5,
    status: "pending",
    lineItems: [
      { description: "Office paper (case)", qty: 12, unit: 42.5 },
      { description: "Toner cartridges", qty: 4, unit: 189 },
    ],
  },
  {
    id: "inv-002",
    vendor: "Blue Ridge Logistics",
    invoiceNumber: "BRL-22019",
    date: "2026-08-26",
    dueDate: "2026-09-12",
    amount: 3890.0,
    status: "pending",
    lineItems: [
      { description: "Freight — August", qty: 1, unit: 3890 },
    ],
  },
  {
    id: "inv-003",
    vendor: "Meridian IT",
    invoiceNumber: "MIT-99102",
    date: "2026-08-26",
    dueDate: "2026-09-15",
    amount: 875.25,
    status: "pending",
    lineItems: [
      { description: "Cloud backup seat", qty: 35, unit: 25.007 },
    ],
  },
  {
    id: "inv-004",
    vendor: "Harbor Electric",
    invoiceNumber: "HE-44102",
    date: "2026-08-27",
    dueDate: "2026-09-14",
    amount: 2100.0,
    status: "pending",
    lineItems: [
      { description: "Panel inspection", qty: 1, unit: 800 },
      { description: "Emergency lighting", qty: 13, unit: 100 },
    ],
  },
  {
    id: "inv-005",
    vendor: "Cascade Cleaning",
    invoiceNumber: "CC-7781",
    date: "2026-08-27",
    dueDate: "2026-09-08",
    amount: 640.0,
    status: "pending",
    lineItems: [
      { description: "Weekly service (4x)", qty: 4, unit: 160 },
    ],
  },
  {
    id: "inv-006",
    vendor: "Summit Security",
    invoiceNumber: "SS-3301",
    date: "2026-08-28",
    dueDate: "2026-09-18",
    amount: 1525.75,
    status: "pending",
    lineItems: [
      { description: "Monitoring — August", qty: 1, unit: 1525.75 },
    ],
  },
  {
    id: "inv-007",
    vendor: "Prairie Foods",
    invoiceNumber: "PF-11902",
    date: "2026-08-28",
    dueDate: "2026-09-05",
    amount: 432.18,
    status: "pending",
    lineItems: [
      { description: "Kitchen restock", qty: 1, unit: 432.18 },
    ],
  },
  {
    id: "inv-008",
    vendor: "Atlas Telecom",
    invoiceNumber: "AT-55021",
    date: "2026-08-29",
    dueDate: "2026-09-20",
    amount: 2899.99,
    status: "pending",
    lineItems: [
      { description: "Fiber circuit", qty: 1, unit: 2899.99 },
    ],
  },
  {
    id: "inv-009",
    vendor: "Redwood Legal",
    invoiceNumber: "RL-8820",
    date: "2026-08-29",
    dueDate: "2026-09-22",
    amount: 3200.0,
    status: "pending",
    lineItems: [
      { description: "Retainer — August", qty: 1, unit: 3200 },
    ],
  },
  {
    id: "inv-010",
    vendor: "Keystone HVAC",
    invoiceNumber: "KH-4419",
    date: "2026-08-30",
    dueDate: "2026-09-16",
    amount: 980.0,
    status: "pending",
    lineItems: [
      { description: "Filter replacement", qty: 1, unit: 180 },
      { description: "Preventive maintenance", qty: 1, unit: 800 },
    ],
  },
  {
    id: "inv-011",
    vendor: "Silverline Marketing",
    invoiceNumber: "SM-2201",
    date: "2026-08-30",
    dueDate: "2026-09-12",
    amount: 1750.0,
    status: "pending",
    lineItems: [
      { description: "Campaign management", qty: 1, unit: 1750 },
    ],
  },
  {
    id: "inv-012",
    vendor: "Orion Analytics",
    invoiceNumber: "OA-9911",
    date: "2026-08-31",
    dueDate: "2026-09-25",
    amount: 499.0,
    status: "pending",
    lineItems: [
      { description: "Dashboard seats", qty: 10, unit: 49.9 },
    ],
  },
];

/** Books CSV — two deliberate mismatches vs portal */
export const BOOKS_ENTRIES: BooksEntry[] = [
  { invoiceId: "inv-001", vendor: "Northwind Supplies", amount: 1240.5 },
  { invoiceId: "inv-002", vendor: "Blue Ridge Logistics", amount: 3890.0 },
  { invoiceId: "inv-003", vendor: "Meridian IT", amount: 900.0 }, // mismatch: portal 875.25
  { invoiceId: "inv-004", vendor: "Harbor Electric", amount: 2100.0 },
  { invoiceId: "inv-005", vendor: "Cascade Cleaning", amount: 640.0 },
  { invoiceId: "inv-006", vendor: "Summit Security", amount: 1525.75 },
  { invoiceId: "inv-007", vendor: "Prairie Foods", amount: 432.18 },
  { invoiceId: "inv-008", vendor: "Atlas Telecom", amount: 2899.99 },
  { invoiceId: "inv-009", vendor: "Redwood Legal", amount: 3200.0 },
  { invoiceId: "inv-010", vendor: "Keystone HVAC", amount: 980.0 },
  { invoiceId: "inv-011", vendor: "Silverline Marketing", amount: 1700.0 }, // mismatch: portal 1750
  { invoiceId: "inv-012", vendor: "Orion Analytics", amount: 499.0 },
];

export function booksCsv(): string {
  const header = "invoice_id,vendor,amount";
  const rows = BOOKS_ENTRIES.map(
    (e) => `${e.invoiceId},${e.vendor},${e.amount.toFixed(2)}`,
  );
  return [header, ...rows].join("\n");
}

export function portalCsv(): string {
  const header = "invoice_id,vendor,invoice_number,date,amount,status";
  const rows = PORTAL_INVOICES.map(
    (i) =>
      `${i.id},${i.vendor},${i.invoiceNumber},${i.date},${i.amount.toFixed(2)},${i.status}`,
  );
  return [header, ...rows].join("\n");
}
