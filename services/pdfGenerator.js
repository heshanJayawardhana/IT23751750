const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a PDF report from the processed test data.
 * @param {Array} processedData - Array of test result objects with dynamic IDs.
 * @param {string} outputPath - Path to save the PDF file.
 */
function generatePDF(processedData, outputPath) {
    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' }); // Landscape for better table fit
    const writeStream = fs.createWriteStream(outputPath);

    // Register Sinhala Font (Fallback chain: Iskoola Pota -> Abhaya Libre -> Noto Sans)
    const iskoolaPath = path.join(__dirname, '../fonts/iskpota.ttf');
    const abhayaPath = path.join(__dirname, '../fonts/AbhayaLibre-Regular.ttf');
    const notoSansPath = path.join(__dirname, '../fonts/NotoSansSinhala-Regular.ttf');

    if (fs.existsSync(iskoolaPath)) {
        doc.registerFont('Sinhala', iskoolaPath);
        console.log('✅ Loaded Iskoola Pota font.');
    } else if (fs.existsSync(abhayaPath)) {
        doc.registerFont('Sinhala', abhayaPath);
        console.log('✅ Loaded Abhaya Libre font.');
    } else if (fs.existsSync(notoSansPath)) {
        doc.registerFont('Sinhala', notoSansPath);
        console.log('⚠️ Using Noto Sans Sinhala (May cause rendering issues).');
    } else {
        console.warn('⚠️ No Sinhala font found! Sinhala text will not render correctly.');
    }

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

    // Reset to Helvetica for the start of the loop
    doc.font('Helvetica');

    processedData.forEach((test) => {
        // Check for page break
        if (y > 500) {
            doc.addPage({ layout: 'landscape', margin: 30 });
            y = 50;
            y = drawHeader(y);
            // Reset to Helvetica after new page header
            doc.font('Helvetica');
        }

        const statusColor = test.status === 'Pass' ? 'green' : 'red';

        doc.fillColor('black');

        // English Column: ID
        doc.font('Helvetica').text(test.id || '', colX.id, y, { width: 60, ellipsis: true });

        // English Column: Name
        doc.text(test.name || '', colX.name, y, { width: 110, ellipsis: true });

        // English/Singlish Column: Input
        doc.text(test.input || '', colX.input, y, { width: 130, ellipsis: true });

        // Sinhala Column: Expected
        doc.font('Sinhala').text(test.expected || '', colX.expected, y, { width: 130, ellipsis: true });

        // Sinhala Column: Actual
        doc.text(test.actual || '', colX.actual, y, { width: 130, ellipsis: true });

        // English Column: Status
        doc.fillColor(statusColor);
        doc.font('Helvetica').text(test.status || '', colX.status, y);

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
