const fs = require("fs");
const PDFDocument = require("pdfkit");

function createInvoice(invoice, path, promoDiscount) {
  console.log(11);
  let doc = new PDFDocument({ size: "A4", margin: 50 });

  generateHeader(doc);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice, promoDiscount);
  generateFooter(doc);

  doc.end();
  doc.pipe(fs.createWriteStream(path));
}

function generateHeader(doc,company,address) {
  doc
    .image("public/invoiceLogo.png", 50, 45, { width: 50 })
    .fillColor("#444444")
    .fontSize(20)
    .text("Sailor's Express", 110, 57)
    .fontSize(10)
    .text("House# 32/1,LEVEL# 6C,Road# 03,", 200, 50, { align: "right" })
    .text("Shyamoli,Sher-e-Bangla Nagor,Dhaka-1207", 200, 65, { align: "right" })
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
    .text("Address : "+invoice.customer.address, 300, customerInformationTop + 15)
    .moveDown();

  generateHr(doc, 252);
  console.log(invoice.customer.deliveryAddress);
}

function generateInvoiceTable(doc, invoice, promoDiscount) {
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
      formatCurrency((item.price+item.vat-item.discount)*item.quantity)
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
  generateTableRow(
    doc,
    deliveryPosition+30,
    "Promo discount",
    "",
    "",
    "",
    "",
    "Tk. "+promoDiscount
  );
  generateHr(doc, deliveryPosition + 45);
  const totalPosition = deliveryPosition + 55;
  doc.font("Helvetica");
  generateTableRow(
    doc,
    totalPosition,
    "",
    "",
    "",
    "Total Vat",
    "Total Dis",
    "Sub Total"
  );
  doc.font("Helvetica")
     .fontSize(20)
  generateTableRow(
    doc,
    totalPosition+20,
    "",
    "",
    "",
    "Tk. "+invoice.vat,
    "Tk. "+invoice.discount,
    ""
  );
  
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    totalPosition+20,
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
      "sailorsexpress.com",
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