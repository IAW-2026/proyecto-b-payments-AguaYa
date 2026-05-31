import PDFDocument from "pdfkit";

export type InvoiceData = {
  id: string;
  subtotal: number;
  tax: number;
  total: number;
  issuedAt: Date;
  payment: {
    orderId: string;
    buyerName: string;
    buyerEmail: string;
    sellerName: string;
    items: { productName: string; quantity: number; unitPrice: number }[];
  };
};

export function buildPDF(invoice: InvoiceData): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const buf = Buffer.concat(chunks);
      resolve(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer);
    });
    doc.on("error", reject);

    const fmt = (n: number) => `$ ${n.toLocaleString("es-AR")}`;
    const date = invoice.issuedAt.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    doc.fontSize(22).font("Helvetica-Bold").text("Factura", { align: "center" });
    doc.moveDown();

    // Encabezado
    doc.fontSize(11).font("Helvetica");
    doc.text(`Fecha de emisión: ${date}`);
    doc.text(`Orden: ${invoice.payment.orderId}`);
    doc.moveDown(0.5);

    doc.font("Helvetica-Bold").text("Comprador");
    doc.font("Helvetica").text(`${invoice.payment.buyerName} (${invoice.payment.buyerEmail})`);
    doc.moveDown(0.5);

    doc.font("Helvetica-Bold").text("Vendedor");
    doc.font("Helvetica").text(invoice.payment.sellerName);
    doc.moveDown();

    // Items
    doc.font("Helvetica-Bold").text("Detalle de la compra");
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);

    doc.font("Helvetica-Bold");
    doc.text("Producto", 50, doc.y, { continued: true, width: 250 });
    doc.text("Cant.", 300, doc.y, { continued: true, width: 80 });
    doc.text("Precio unit.", 380, doc.y, { continued: true, width: 100 });
    doc.text("Subtotal", 480, doc.y, { width: 70, align: "right" });
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);

    doc.font("Helvetica");
    for (const item of invoice.payment.items) {
      const itemSubtotal = item.quantity * item.unitPrice;
      doc.text(item.productName, 50, doc.y, { continued: true, width: 250 });
      doc.text(String(item.quantity), 300, doc.y, { continued: true, width: 80 });
      doc.text(fmt(item.unitPrice), 380, doc.y, { continued: true, width: 100 });
      doc.text(fmt(itemSubtotal), 480, doc.y, { width: 70, align: "right" });
    }

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Totales
    doc.font("Helvetica").text("Subtotal", { continued: true }).text(fmt(invoice.subtotal), { align: "right" });
    doc.text("IVA (21%)", { continued: true }).text(fmt(invoice.tax), { align: "right" });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").text("Total", { continued: true }).text(fmt(invoice.total), { align: "right" });

    doc.end();
  });
}
