const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const generatePDF = require('./services/pdfGenerator');
const generateExcel = require('./services/excelGenerator');

const RESULTS_DIR = path.join(__dirname, 'test-results');
const PUBLIC_DIR = path.join(__dirname, 'public');
const RESULTS_FILE = path.join(RESULTS_DIR, 'results.json');
const TEST_DATA_FILE = path.join(__dirname, 'data/testData.json');

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR);
}

// Load static test data (TC_XXX)
let staticTestData = [];
if (fs.existsSync(TEST_DATA_FILE)) {
    staticTestData = JSON.parse(fs.readFileSync(TEST_DATA_FILE, 'utf-8'));
}

console.log('🚀 Starting Test & Report Automation...');

// 1. Run Playwright Tests
console.log('running tests...');
exec('npx playwright test', (error, stdout, stderr) => {
    if (error) {
        console.warn('Tests completed with failures (this is expected for reporting purposes).');
    }
    console.log('Tests finished.');

    // 2. Read Results
    if (!fs.existsSync(RESULTS_FILE)) {
        console.error('❌ Test results file not found!');
        process.exit(1);
    }

    const resultsData = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));
    console.log('✅ Test results parsed.');

    // 3. Process Data for Reports (Dynamic ID Assignment)
    console.log('🔄 Processing data for dynamic ID generation...');

    let posCounter = 0;
    let negCounter = 0;
    let uiCounter = 0;
    let processedData = [];

    const pad = (num) => String(num).padStart(4, '0');

    // Helper to extract tests
    const flattenTests = (suites) => {
        let tests = [];
        suites.forEach(suite => {
            if (suite.specs) {
                suite.specs.forEach(spec => {
                    const test = spec.tests[0];
                    const result = test.results[0];
                    const title = spec.title;

                    // Extract ID from title (expected format: "TC_XXX: Name" or just "Name" for UI tests)
                    let staticInfo = {};

                    // Check if it's a UI test (starts with Pos_UI or custom name)
                    if (title.includes('Pos_UI')) {
                        // Keep UI tests as is or handle separately if needed
                        // For now assuming UI tests are separate
                        // Extract actual output from annotations
                        const actualOutAnnotation = test.annotations.find(a => a.type === 'actualOutput');
                        const actualOutput = actualOutAnnotation ? actualOutAnnotation.description : '';

                        processedData.push({
                            id: title.split(':')[0].trim(), // Keep original ID for UI
                            name: title.split(':')[1]?.trim() || title,
                            input: 'UI Interaction', // Placeholder
                            expected: 'Real-time update',
                            actual: actualOutput,
                            status: result.status === 'passed' ? 'Pass' : 'Fail',
                            lengthType: 'S', // Default
                            justification: 'Real-time validation',
                            covered: 'UI Responsiveness'
                        });
                        return;
                    }

                    // For functional tests, find matching static data by ID in title
                    const parts = title.split(':');
                    const id = parts[0].trim();
                    staticInfo = staticTestData.find(d => d.id === id) || {};

                    // Assign Dynamic ID
                    let dynamicID = '';
                    if (result.status === 'passed') {
                        posCounter++;
                        dynamicID = `Pos_Fun_${pad(posCounter)}`;
                    } else {
                        negCounter++;
                        dynamicID = `Neg_Fun_${pad(negCounter)}`;
                    }

                    // Extract actual output
                    const actualOutAnnotation = test.annotations.find(a => a.type === 'actualOutput');
                    const actualOutput = actualOutAnnotation ? actualOutAnnotation.description : '';

                    // Calculate Input length type
                    const getInputLengthType = (input) => {
                        if (!input) return 'S';
                        const len = input.length;
                        if (len <= 30) return 'S';
                        if (len >= 300) return 'L';
                        return 'M';
                    };

                    processedData.push({
                        id: dynamicID,
                        name: staticInfo.name || title,
                        input: staticInfo.input || '',
                        expected: staticInfo.expected || '',
                        actual: actualOutput,
                        status: result.status === 'passed' ? 'Pass' : 'Fail',
                        lengthType: getInputLengthType(staticInfo.input),
                        justification: '',
                        covered: ''
                    });
                });
            }
            if (suite.suites) {
                flattenTests(suite.suites);
            }
        });
    };

    flattenTests(resultsData.suites || []);

    // Sort logic if needed (e.g. Put Pos first, then Neg)
    // processedData.sort(...) 

    // 4. Generate Reports with Processed Data
    const pdfPath = path.join(PUBLIC_DIR, 'test_report.pdf');
    const excelPath = path.join(PUBLIC_DIR, 'test_report.xlsx');

    console.log('Generating PDF report...');
    const pdfStream = generatePDF(processedData, pdfPath); // Pass processed data
    pdfStream.then(() => console.log(`📄 PDF Report saved to: ${pdfPath}`))
        .catch(err => console.error('❌ Error generating PDF:', err));

    console.log('Generating Excel report...');
    generateExcel(processedData, excelPath) // Pass processed data
        .then(() => console.log(`📊 Excel Report saved to: ${excelPath}`))
        .catch(err => console.error('❌ Error generating Excel:', err));

});
