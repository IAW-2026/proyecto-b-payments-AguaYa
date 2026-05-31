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
  };
};

export function buildPDF(invoice: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const fmt = (n: number) => `$ ${n.toLocaleString("es-AR")}`;
    const date = invoice.issuedAt.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    doc.fontSize(22).font("Helvetica-Bold").text("Factura", { align: "center" });
    doc.moveDown();

    doc.fontSize(11).font("Helvetica");
    doc.text(`Fecha de emisión: ${date}`);
    doc.text(`Orden: ${invoice.payment.orderId}`);
    doc.text(`Comprador: ${invoice.payment.buyerName} (${invoice.payment.buyerEmail})`);
    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    doc.font("Helvetica").text("Subtotal", { continued: true }).text(fmt(invoice.subtotal), { align: "right" });
    doc.text("IVA (21%)", { continued: true }).text(fmt(invoice.tax), { align: "right" });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").text("Total", { continued: true }).text(fmt(invoice.total), { align: "right" });

    doc.end();
  });
}
