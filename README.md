# Singlish to Sinhala Transliteration Test Automation

This project automates the testing of the [SwiftTranslator](https://www.swifttranslator.com/) web application using **Playwright**. It executes a suite of test cases defined in a JSON file and generates detailed execution reports in both Excel and PDF formats.

## 🚀 Features

- **Automated Testing**: Simulates user input to verify Singlish to Sinhala transliteration.
- **Dynamic Reporting**:
    - **Excel Report**: Detailed test results with columns for Input, Expected, Actual, Status, and more.
    - **PDF Report**: A professional summary verification report.
- **Dynamic Test Case IDs**:
    - IDs are generated at runtime based on the execution result.
    - **Matched/Passed**: `Pos_Fun_XXXX` (e.g., `Pos_Fun_0001`)
    - **Failed/Mismatch**: `Neg_Fun_XXXX` (e.g., `Neg_Fun_0001`)
- **Robustness**: Handles locked output files (e.g., if the Excel report is open) by saving to a timestamped backup automatically.

## 🛠️ Prerequisites

- **Node.js**: Ensure Node.js is installed on your machine.

## 📦 Installation

1. Clone the repository or download the source code.
2. Open a terminal in the project root directory.
3. Install dependencies:

```bash
npm install
```

## ▶️ Running Tests & Generating Reports

To run the tests and generate the reports, execute the following command:

```bash
npm run test:report
```

This command will:
1. Execute the Playwright test suite (headless mode).
2. Process results and assign dynamic IDs `Pos_Fun` or `Neg_Fun`.
3. Generate reports in the `public/` directory.

> **Note**: Console errors like "Tests completed with failures" are expected if the test suite contains negative test cases or mismatches.

## 📂 Output

Reports are generated in the `public/` folder:

- **`test_report.xlsx`**: Full Excel report.
- **`test_report.pdf`**: Summary PDF report.

## 📁 Project Structure

- **`data/testData.json`**: Contains the test cases (Input, Expected Output, etc.).
- **`tests/app.spec.js`**: Playwright test specifications.
- **`services/`**:
    - `excelGenerator.js`: Logic for creating the Excel report.
    - `pdfGenerator.js`: Logic for creating the PDF report.
- **`run-report.js`**: Main orchestration script that runs tests, processes data, and calls generators.
- **`public/`**: Directory where generated reports are saved.
