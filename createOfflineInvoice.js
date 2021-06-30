const fs = require("fs");
const PDFDocument = require("pdfkit");

function createInvoice(invoice, path,vendor) {
  let doc = new PDFDocument({ size: "A4", margin: 50 });

  generateHeader(doc,vendor);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice);
  generateFooter(doc);

  doc.end();
  doc.pipe(fs.createWriteStream(path));
}

function generateHeader(doc,vendor) {
  doc
    // .image("public/logo.png", 50, 45, { width: 50, align:"center"})
    .fillColor("#444444")
    .fontSize(16)
    .text('vendor.vendorName', 110,50, { width:200,align: "center"})
    .fontSize(10)
    .text('vendor.address', 110, 80, { width:200,align: "center" })
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Invoice", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("Invoice Number:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(invoice.orderId, 150, customerInformationTop)
    .font("Helvetica")
    .text("Invoice Date:", 50, customerInformationTop + 15)
    .text(formatDate(new Date()), 150, customerInformationTop + 15)
    // .text("Customer:", 50, customerInformationTop + 30)
    // .text(
    //   invoice.shipping.phone,
    //   150,
    //   customerInformationTop + 30
    // )

    .font("Helvetica-Bold")
    .text("Phone : "+invoice.phone, 300, customerInformationTop)
    .font("Helvetica")
    .text("Address : "+invoice.customer.deliveryAddress, 300, customerInformationTop + 15)
    .moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(doc, invoice) {
  let i;
  const invoiceTableTop = 330;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Item",
    "Quantity",
    "Unit Cost",
    "Vat",
    "Discount",
    "Line Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  for (i = 0; i < invoice.products.length; i++) {
    const item = invoice.products[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.name.substr(0,25),
      item.quantity,
      formatCurrency(item.price),
      item.vat,
      item.discount,
      formatCurrency((item.price * item.quantity)+item.vat-item.discount)
    );

    generateHr(doc, position + 20);
  }
  const deliveryPosition = invoiceTableTop + (i + 1) * 30;
  doc.font("Helvetica");
  generateTableRow(
    doc,
    deliveryPosition,
    "Delivery Charge",
    "",
    "",
    "",
    "",
    "Tk. "+invoice.deliveryCharge
  );
  generateHr(doc, deliveryPosition + 20);
  const totalPosition = deliveryPosition + 30;
  doc.font("Helvetica");
  generateTableRow(
    doc,
    totalPosition,
    "",
    "",
    "",
    invoice.vat,
    invoice.discount,
    ""
  );
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    totalPosition,
    "",
    "",
    "",
    "",
    "",
    formatCurrency(invoice.totalBill)
  );
  doc.font("Helvetica");
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      "https://www.sailorsexpress.com/",
      50,
      780,
      { align: "center", width: 500 }
    );
}

function generateTableRow(
  doc,
  y,
  item,
  unitCost,
  vat,
  discount,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(unitCost, 140, y, { width: 90, align: "right" })
    .text(vat, 220, y, { width: 90, align: "right" })
    .text(discount, 290, y, { width: 90, align: "right" })
    .text(quantity, 350, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function formatCurrency(cents) {
  return "Tk. " + (cents).toFixed(2);
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return day+ "/" + month + "/" + year ;
}

module.exports = {
  createInvoice
};