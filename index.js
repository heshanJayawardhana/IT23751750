console.log("Hello Node.js");

const express = require("express");
const app = express();
const testData = require("./data/testData.json");
const generatePDF = require("./services/pdfGenerator");
const generateExcel = require("./services/excelGenerator");

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/generate-pdf", (req, res) => {
  const filename = "test_data_report.pdf";
  res.setHeader("Content-disposition", 'attachment; filename="' + filename + '"');
  res.setHeader("Content-type", "application/pdf");
  generatePDF(testData, res);
});

app.get("/generate-excel", async (req, res) => {
  const filename = "test_data_report.xlsx";
  res.setHeader("Content-disposition", 'attachment; filename="' + filename + '"');
  res.setHeader("Content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  await generateExcel(testData, res);
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
