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


let index = 1;
for (const record of records) {
  // testId나 description이 이전 포맷이거나 새 포맷(No., Test Step)인 경우 모두 지원합니다.
  // CSV 파일에 BOM 문자열이 있을 수 있으므로 인덱스를 추가하여 무조건 고유한 타이틀을 생성합니다.
  const id = record['No.'] || record.testId || `TC-${index}`;
  const description = record['5 Depth'] || record['Test Step'] || record.description || '이름 없음';
  
  test(`[${id}] ${description} (#${index})`, async ({ page }) => {
    // url 컬럼이 없을 경우 치지직(사용자 테스트 대상) 메인 페이지를 기본값으로 사용합니다.
    const url = record.url || 'https://chzzk.naver.com/';
    
    // 1. 테스트 대상 URL 접속
    await page.goto(url);
    
    // 2. 타이틀 확인 (이전 테스트 데이터 호환)
    if (record.expectedTitle) {
      await expect(page).toHaveTitle(new RegExp(record.expectedTitle));
    }
  });
  
  index++;
}
