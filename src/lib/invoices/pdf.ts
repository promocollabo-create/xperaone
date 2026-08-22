import "server-only";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { formatDateShort } from "@/lib/utils";

export type InvoicePdfData = {
  invoiceNumber: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; unitPrice: string; subtotal: string }[];
  subtotal: string;
  total: string;
  currency: string;
  status: string;
  createdAt: Date;
};

export async function generateInvoicePdf(data: InvoicePdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const purple = rgb(0.43, 0.16, 0.85);
  const dark = rgb(0.12, 0.1, 0.18);
  const gray = rgb(0.45, 0.45, 0.5);

  let y = 800;

  page.drawRectangle({ x: 0, y: 780, width: 595.28, height: 62, color: purple });
  page.drawText("XperaOne", { x: 40, y: 805, size: 22, font: bold, color: rgb(1, 1, 1) });
  page.drawText("Digital Marketplace Invoice", { x: 40, y: 788, size: 10, font, color: rgb(0.9, 0.85, 1) });

  y = 750;
  page.drawText(`Invoice #: ${data.invoiceNumber}`, { x: 40, y, size: 11, font: bold, color: dark });
  y -= 16;
  page.drawText(`Order #: ${data.orderNumber}`, { x: 40, y, size: 11, font, color: dark });
  y -= 16;
  page.drawText(`Date: ${formatDateShort(data.createdAt)}`, { x: 40, y, size: 11, font, color: dark });
  y -= 16;
  page.drawText(`Status: ${data.status.toUpperCase()}`, { x: 40, y, size: 11, font: bold, color: purple });

  y -= 30;
  page.drawText("Billed To:", { x: 40, y, size: 11, font: bold, color: dark });
  y -= 16;
  page.drawText(data.customerName, { x: 40, y, size: 11, font, color: dark });
  y -= 14;
  page.drawText(data.customerEmail, { x: 40, y, size: 11, font, color: gray });

  y -= 34;
  page.drawRectangle({ x: 40, y: y - 4, width: 515, height: 22, color: rgb(0.95, 0.93, 1) });
  page.drawText("Product", { x: 48, y, size: 10, font: bold, color: dark });
  page.drawText("Qty", { x: 350, y, size: 10, font: bold, color: dark });
  page.drawText("Unit Price", { x: 400, y, size: 10, font: bold, color: dark });
  page.drawText("Subtotal", { x: 480, y, size: 10, font: bold, color: dark });
  y -= 26;

  for (const item of data.items) {
    page.drawText(item.name.slice(0, 45), { x: 48, y, size: 10, font, color: dark });
    page.drawText(String(item.quantity), { x: 355, y, size: 10, font, color: dark });
    page.drawText(`${data.currency} ${item.unitPrice}`, { x: 400, y, size: 10, font, color: dark });
    page.drawText(`${data.currency} ${item.subtotal}`, { x: 480, y, size: 10, font, color: dark });
    y -= 20;
  }

  y -= 10;
  page.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 1, color: rgb(0.85, 0.85, 0.9) });
  y -= 24;

  page.drawText("Subtotal:", { x: 400, y, size: 11, font, color: dark });
  page.drawText(`${data.currency} ${data.subtotal}`, { x: 480, y, size: 11, font, color: dark });
  y -= 20;
  page.drawText("Total:", { x: 400, y, size: 13, font: bold, color: purple });
  page.drawText(`${data.currency} ${data.total}`, { x: 480, y, size: 13, font: bold, color: purple });

  y -= 60;
  page.drawText("Thank you for shopping with XperaOne.", { x: 40, y, size: 10, font, color: gray });

  return doc.save();
}
