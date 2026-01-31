const PDFDocument = require('pdfkit');
const fs = require('fs');

/**
 * Generates a PDF report from the processed test data.
 * @param {Array} processedData - Array of test result objects with dynamic IDs.
 * @param {string} outputPath - Path to save the PDF file.
 */
function generatePDF(processedData, outputPath) {
    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' }); // Landscape for better table fit
    const writeStream = fs.createWriteStream(outputPath);

    doc.pipe(writeStream);

    // Header
    doc.fontSize(20).text('Test Execution Report', { align: 'center' });
    doc.moveDown();

    // Calculate Stats
    const total = processedData.length;
    const passed = processedData.filter(d => d.status === 'Pass').length;
    const failed = processedData.filter(d => d.status === 'Fail').length;

    doc.fontSize(12).text(`Total Tests: ${total}   Passed: ${passed}   Failed: ${failed}`);
    doc.moveDown();

    // Table Helper
    const tableTop = 150;
    let y = tableTop;
    const itemHeight = 20;

    doc.fontSize(10);

    // Define column positions
    const colX = {
        id: 30,
        name: 100,
        input: 220,
        expected: 360,
        actual: 500,
        status: 640
    };

    // Draw Table Header
    const drawHeader = (yPos) => {
        doc.font('Helvetica-Bold');
        doc.text('TC ID', colX.id, yPos);
        doc.text('Test Case Name', colX.name, yPos);
        doc.text('Input', colX.input, yPos);
        doc.text('Expected', colX.expected, yPos);
        doc.text('Actual', colX.actual, yPos);
        doc.text('Status', colX.status, yPos);

        yPos += itemHeight;
        doc.moveTo(30, yPos).lineTo(780, yPos).stroke();
        return yPos + 10;
    };

    y = drawHeader(y);
    doc.font('Helvetica');

    processedData.forEach((test) => {
        // Check for page break
        if (y > 500) {
            doc.addPage({ layout: 'landscape', margin: 30 });
            y = 50;
            y = drawHeader(y);
            doc.font('Helvetica');
        }

        const statusColor = test.status === 'Pass' ? 'green' : 'red';

        doc.fillColor('black');
        doc.text(test.id || '', colX.id, y, { width: 60, ellipsis: true });
        doc.text(test.name || '', colX.name, y, { width: 110, ellipsis: true });
        doc.text(test.input || '', colX.input, y, { width: 130, ellipsis: true });
        doc.text(test.expected || '', colX.expected, y, { width: 130, ellipsis: true });
        doc.text(test.actual || '', colX.actual, y, { width: 130, ellipsis: true });

        doc.fillColor(statusColor);
        doc.text(test.status || '', colX.status, y);

        y += itemHeight;
        doc.moveTo(30, y).lineTo(780, y).stroke();
        y += 10;
    });

    doc.end();

    return new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
    });
}

module.exports = generatePDF;
