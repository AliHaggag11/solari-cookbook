import PDFDocument from "pdfkit";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { PORTAL_INVOICES } = await import("@/lib/portal/data");
  const invoice = PORTAL_INVOICES.find((i) => i.id === id);
  if (!invoice) {
    return new Response("Not found", { status: 404 });
  }

  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(c as Buffer));

  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.fontSize(20).text("Vendor Invoice", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Invoice #: ${invoice.invoiceNumber}`);
  doc.text(`Vendor: ${invoice.vendor}`);
  doc.text(`Date: ${invoice.date}`);
  doc.text(`Due: ${invoice.dueDate}`);
  doc.moveDown();
  doc.text("Line items:");
  for (const line of invoice.lineItems) {
    doc.text(
      `  ${line.description} — ${line.qty} × $${line.unit.toFixed(2)} = $${(line.qty * line.unit).toFixed(2)}`,
    );
  }
  doc.moveDown();
  doc.fontSize(14).text(`Total: $${invoice.amount.toFixed(2)}`, { align: "right" });
  doc.end();

  const pdf = await done;
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
    },
  });
}
