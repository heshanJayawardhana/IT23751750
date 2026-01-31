const ExcelJS = require('exceljs');

/**
 * Generates an Excel report from the processed test data.
 * @param {Array} processedData - Array of test result objects with dynamic IDs.
 * @param {string} outputPath - Path to save the Excel file.
 */
async function generateExcel(processedData, outputPath) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test Execution Results');

    // Define columns as per user request
    worksheet.columns = [
        { header: 'TC ID', key: 'id', width: 15 },
        { header: 'Test case name', key: 'name', width: 30 },
        { header: 'Input length type', key: 'lengthType', width: 15 },
        { header: 'Input', key: 'input', width: 40 },
        { header: 'Expected output', key: 'expected', width: 40 },
        { header: 'Actual output', key: 'actual', width: 40 },
        { header: 'Status', key: 'status', width: 10 },
        { header: 'Accuracy justification/ Description of issue type', key: 'justification', width: 40 },
        { header: 'What is covered by the test', key: 'covered', width: 40 }
    ];

    // Add rows directly from processed data
    worksheet.addRows(processedData);

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Styling content
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            // Validate Status Cell
            const statusCell = row.getCell('status');
            if (statusCell.value === 'Pass') {
                statusCell.font = { color: { argb: 'FF008000' } }; // Green
            } else if (statusCell.value === 'Fail') {
                statusCell.font = { color: { argb: 'FFFF0000' } }; // Red
            }

            // Wrap text for long columns
            row.getCell('input').alignment = { wrapText: true };
            row.getCell('expected').alignment = { wrapText: true };
            row.getCell('actual').alignment = { wrapText: true };
        }
    });

    // Write to file with retry logic for locked files
    try {
        await workbook.xlsx.writeFile(outputPath);
    } catch (error) {
        if (error.code === 'EBUSY') {
            console.warn(`⚠️ Warning: '${outputPath}' is open or locked.`);
            const timestamp = new Date().getTime();
            const newPath = outputPath.replace('.xlsx', `_${timestamp}.xlsx`);
            await workbook.xlsx.writeFile(newPath);
            console.log(`✅ Saved report to new file: ${newPath}`);
        } else {
            throw error;
        }
    }
}

module.exports = generateExcel;
