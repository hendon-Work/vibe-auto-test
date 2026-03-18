import {
  Reporter,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';
import { google } from 'googleapis';

class GoogleSheetsReporter implements Reporter {
  private results: any[] = [];

  onTestEnd(test: TestCase, result: TestResult) {
    // 테스트 제목에서 "[TC-001]" 같은 형태를 추출하여 파싱합니다.
    const testIdMatch = test.title.match(/\[(.*?)\]/);
    const testId = testIdMatch ? testIdMatch[1] : 'N/A';
    // "[TC-001] " 부분을 제외한 순수 설명 부분
    const pureTitle = test.title.replace(/\[.*?\]\s*/, '');

    this.results.push({
      testId,
      title: pureTitle,
      status: result.status,
      duration: result.duration,
      error: result.error?.message || '',
    });
  }

  async onEnd(result: FullResult) {
    console.log(`Finished the run: ${result.status}`);
    
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    // 시크릿의 멀티라인 문자열 처리
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!spreadsheetId || !clientEmail || !privateKey) {
      console.log('Google Sheets 인증 정보가 없어 리포팅을 건너뜁니다.');
      return;
    }

    try {
      const auth = new google.auth.JWT(
        clientEmail,
        undefined,
        privateKey,
        ['https://www.googleapis.com/auth/spreadsheets']
      );

      const sheets = google.sheets({ version: 'v4', auth });
      
      // 동적으로 첫 번째 워크시트(탭)의 이름 가져오기
      const spreadsheetInfo = await sheets.spreadsheets.get({ spreadsheetId });
      const firstSheetName = spreadsheetInfo.data.sheets?.[0]?.properties?.title || '시트1';

      // 기록할 데이터 양식
      const values = this.results.map(r => [
        r.testId,
        r.title,
        r.status,
        r.duration,
        r.error
      ]);

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `'${firstSheetName}'!A:E`, // 첫 번째 시트의 A열부터 데이터 기입
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });
      
      console.log(`Google Sheets('${firstSheetName}') 리포팅 업데이트 완료!`);
    } catch (e: any) {
      console.error('Google Sheets 연동 중 에러 발생:', e.message || e);
    }
  }
}

export default GoogleSheetsReporter;
