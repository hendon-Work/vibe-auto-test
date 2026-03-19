import fs from 'fs';
import path from 'path';

export interface TestCase {
  no: string;
  url: string;
  depth1: string;
  depth2: string;
  depth3: string;
  depth4: string;
  depth5: string;
  precondition: string;
  testStep: string;
  expectedResult: string;
  result: string;
}

export function generatePlaywrightCode(testCases: TestCase[]): { generatedCount: number, filePath: string } {
  let generatedCount = 0;
  let allSpecCode = `import { test, expect } from '@playwright/test';\n\n`;

  for (const tc of testCases) {
    if (!tc.url && !tc.testStep && !tc.depth5) continue;

    const testId = tc.no || `TC-${generatedCount + 1}`;
    const url = tc.url || '';
    const desc = [tc.depth1, tc.depth2, tc.depth3, tc.depth4, tc.depth5].filter(Boolean).join(' > ') || `테스트 ${testId}`;

    const preCondition = tc.precondition || '';
    const testStep = tc.testStep || '';
    const expectedResult = tc.expectedResult || '';

    let parsedSteps = `    // 1. 페이지 접속\n`;
    if (url) {
      parsedSteps += `    await page.goto(${JSON.stringify(url)});\n`;
    }
    
    const stepLines = testStep.split(/\n|<br>|<br\/>/).map(l => l.trim()).filter(l => l.length > 0);
    
    for (const line of stepLines) {
      parsedSteps += `    // ${line}\n`;
      const targetMatch = line.match(/'([^']+)'|"([^"]+)"/);
      const target = targetMatch ? (targetMatch[1] || targetMatch[2]) : null;
      
      if (line.includes('입력')) {
        if (target) {
          parsedSteps += `    await page.getByRole('textbox').first().fill('${target}');\n`;
        } else {
          parsedSteps += `    await page.getByRole('textbox').first().fill('자동생성 텍스트');\n`;
        }
      } else if (line.includes('클릭') || line.includes('선택')) {
        if (line.includes('버튼') && target) {
          parsedSteps += `    await page.getByRole('button', { name: '${target}' }).first().click();\n`;
        } else if (target) {
          parsedSteps += `    await page.getByText('${target}').first().click();\n`;
        } else {
          parsedSteps += `    // TODO: 대상을 특정할 수 없는 클릭/선택입니다. 적절한 Locator를 지정하세요.\n`;
        }
      }
    }
    
    let parsedAsserts = '';
    const expectedLines = expectedResult.split(/\n|<br>|<br\/>/).map(l => l.trim()).filter(l => l.length > 0);
    
    for (const line of expectedLines) {
      parsedAsserts += `    // 예상 결과: ${line}\n`;
      
      const urlMatch = line.match(/https?:\/\/[^\s)]+/);
      if (urlMatch) {
        const matchUrl = urlMatch[0];
        if (line.includes('새 창')) {
          parsedAsserts += `    // 새 창의 경우 URL 검증 시 page 객체 대신 생성된 팝업 컨텍스트를 사용해야 합니다.\n`;
          parsedAsserts += `    // await expect(newPage).toHaveURL('${matchUrl}');\n`;
        } else {
          parsedAsserts += `    await expect(page).toHaveURL('${matchUrl}');\n`;
        }
      } else if (line.includes('표시') || line.includes('노출') || line.includes('메시지') || line.includes('확인')) {
        const targetMatch = line.match(/'([^']+)'|"([^"]+)"/);
        if (targetMatch) {
           parsedAsserts += `    await expect(page.getByText('${targetMatch[1] || targetMatch[2]}').first()).toBeVisible();\n`;
        } else {
           parsedAsserts += `    // await expect(page.locator('검증할_요소_셀렉터')).toBeVisible();\n`;
        }
      } else {
        parsedAsserts += `    // TODO: 자동화할 수 없는 추가적인 수동 검증 요소가 있을 수 있습니다.\n`;
      }
    }

    const actionCode = parsedSteps.trimEnd();
    const assertionCode = parsedAsserts.trimEnd();
      
    const testComment = `// [AI 테스트 템플릿]
// ID: ${testId}
// 범주: ${desc}
// 사전조건: ${preCondition}`;
  
    const singleTestCode = `${testComment}
test(${JSON.stringify(desc + ' 검증')}, async ({ page }) => {
${actionCode}
    
${assertionCode}
});`;
    
    allSpecCode += singleTestCode + '\n\n';
    generatedCount++;
  }

  // 최상위 테스트 폴더 설정
  const outputDir = path.join(process.cwd(), 'tests');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1개의 통합 테스트 파일로 저장
  const filename = `vibe-tc-all.spec.ts`;
  const outputPath = path.join(outputDir, filename);

  fs.writeFileSync(outputPath, allSpecCode, 'utf-8');
  
  return { generatedCount, filePath: 'tests/vibe-tc-all.spec.ts' };
}
