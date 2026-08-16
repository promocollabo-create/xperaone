import PDFDocument from "pdfkit";

export interface InvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  orderDate: string;
  storeName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  billingAddress?: string | null;
  items: { name: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
}

// Renders a clean, single-page invoice as a Buffer — attach it to emails or
// stream it from an API route. Kept intentionally simple (no external fonts
// or images) so it never fails to render regardless of what's configured in
// site_settings.
export function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc.fontSize(20).fillColor("#111936").text(data.storeName, { continued: false });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#6b7280").text("INVOICE");
    doc.moveDown(1);

    // Invoice meta (right-aligned block)
    const metaTop = doc.y;
    doc.fontSize(10).fillColor("#111827");
    doc.text(`Invoice #: ${data.invoiceNumber}`, 350, metaTop, { width: 200, align: "right" });
    doc.text(`Order #: ${data.orderNumber}`, 350, doc.y, { width: 200, align: "right" });
    doc.text(`Date: ${data.orderDate}`, 350, doc.y, { width: 200, align: "right" });

    doc.y = metaTop;
    doc.fontSize(10).fillColor("#111827");
    doc.text("Bill To:", 50, metaTop);
    doc.text(data.customerName, 50, doc.y);
    doc.text(data.customerEmail, 50, doc.y);
    if (data.customerPhone) doc.text(data.customerPhone, 50, doc.y);
    if (data.billingAddress) doc.text(data.billingAddress, 50, doc.y, { width: 260 });

    doc.moveDown(2);

    // Items table header
    const tableTop = doc.y + 10;
    doc.fontSize(10).fillColor("#6b7280");
    doc.text("Item", 50, tableTop);
    doc.text("Qty", 320, tableTop, { width: 60, align: "right" });
    doc.text("Unit Price", 380, tableTop, { width: 80, align: "right" });
    doc.text("Total", 460, tableTop, { width: 90, align: "right" });
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor("#e5e9f7").stroke();

    let y = tableTop + 25;
    doc.fillColor("#111827");
    for (const item of data.items) {
      const lineTotal = item.quantity * item.unitPrice;
      doc.text(item.name, 50, y, { width: 260 });
      doc.text(String(item.quantity), 320, y, { width: 60, align: "right" });
      doc.text(`$${item.unitPrice.toFixed(2)}`, 380, y, { width: 80, align: "right" });
      doc.text(`$${lineTotal.toFixed(2)}`, 460, y, { width: 90, align: "right" });
      y += 22;
    }

    doc.moveTo(50, y + 5).lineTo(550, y + 5).strokeColor("#e5e9f7").stroke();
    y += 20;

    doc.fontSize(10).fillColor("#6b7280").text("Subtotal", 380, y, { width: 80, align: "right" });
    doc.fillColor("#111827").text(`$${data.subtotal.toFixed(2)}`, 460, y, { width: 90, align: "right" });
    y += 18;

    if (data.discount > 0) {
      doc.fillColor("#6b7280").text("Discount", 380, y, { width: 80, align: "right" });
      doc.fillColor("#111827").text(`-$${data.discount.toFixed(2)}`, 460, y, { width: 90, align: "right" });
      y += 18;
    }

    doc.fontSize(12).fillColor("#111936").text("Total", 380, y, { width: 80, align: "right" });
    doc.text(`$${data.total.toFixed(2)}`, 460, y, { width: 90, align: "right" });
    y += 30;

    doc.fontSize(10).fillColor("#6b7280");
    doc.text(`Payment method: ${data.paymentMethod}`, 50, y);
    doc.text(`Payment status: ${data.paymentStatus}`, 50, doc.y);
    doc.text(`Order status: ${data.orderStatus}`, 50, doc.y);

    doc.end();
  });
}
