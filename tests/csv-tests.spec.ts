import { test, expect } from '@playwright/test';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

const csvFileName = process.env.CSV_FILE || 'test-data.csv';
const csvFilePath = path.join(__dirname, csvFileName);

let records: any[] = [];
if (fs.existsSync(csvFilePath)) {
  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
  records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });
} else {
  console.error(`지정한 CSV 파일을 찾을 수 없습니다: ${csvFilePath}`);
}


for (const record of records) {
  test(`[${record.testId}] ${record.description}`, async ({ page }) => {
    // 1. 테스트 대상 URL 접속
    await page.goto(record.url);
    
    // 2. 간단한 검증 (타이틀 확인)
    if (record.expectedTitle) {
      await expect(page).toHaveTitle(new RegExp(record.expectedTitle));
    }
  });
}
