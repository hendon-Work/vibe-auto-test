import { NextResponse } from 'next/server';
import { generatePlaywrightCode, TestCase } from '@/lib/generator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const testCases: TestCase[] = body.testCases;

    if (!testCases || !Array.isArray(testCases)) {
      return NextResponse.json(
        { error: 'Invalid or missing test cases array.' },
        { status: 400 }
      );
    }

    const { generatedCount, filePath } = generatePlaywrightCode(testCases);

    return NextResponse.json({
      success: true,
      generatedCount,
      filePath,
      message: `Successfully generated ${generatedCount} test cases within ${filePath}`
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unknown error occurred while generating code.' },
      { status: 500 }
    );
  }
}
