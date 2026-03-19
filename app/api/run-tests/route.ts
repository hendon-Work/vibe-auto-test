import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";
import { google } from "googleapis";

const execAsync = util.promisify(exec);

async function reportToGoogleSheets(result: any, success: boolean) {
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  // Handle literal "\n" strings in env vars containing private keys
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !privateKey || !sheetId) {
    console.warn("Google Sheets credentials are not fully configured in .env.local");
    return { reported: false, error: "Credentials missing" };
  }

  try {
    const auth = new google.auth.JWT(
      email,
      undefined,
      privateKey,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });
    const dateStr = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let duration = "0s";
    let statusText = success ? "Success" : "Failed";

    if (result && result.stats) {
      passed = result.stats.expected || 0;
      failed = result.stats.unexpected || 0;
      skipped = (result.stats.flaky || 0) + (result.stats.skipped || 0);
      duration = (result.stats.duration / 1000).toFixed(2) + "s";
      if (failed > 0) statusText = "Failed";
    }

    const row = [
      dateStr,
      statusText,
      passed.toString(),
      failed.toString(),
      skipped.toString(),
      duration
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:F', // 기본 시트 이름 (Sheet1)
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row]
      }
    });

    return { reported: true };
  } catch (err: any) {
    console.error("Failed to append to Google Sheets:", err.message);
    return { reported: false, error: err.message };
  }
}

export async function POST() {
  try {
    const { stdout, stderr } = await execAsync("npx playwright test --reporter=json");

    let result = null;
    try {
      result = JSON.parse(stdout);
    } catch {
      console.warn("Could not parse test stdout as JSON");
    }

    const gsheet = await reportToGoogleSheets(result, true);

    return NextResponse.json({ success: true, result, stdout, stderr, gsheet });
  } catch (error: any) {
    let result = null;
    try {
      if (error.stdout) {
        result = JSON.parse(error.stdout);
      }
    } catch {
      // do nothing
    }

    const gsheet = await reportToGoogleSheets(result, false);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        result: result,
        stdout: error.stdout,
        stderr: error.stderr,
        gsheet,
      },
      { status: 200 } // Send 200 so frontend can parse standard json response
    );
  }
}
