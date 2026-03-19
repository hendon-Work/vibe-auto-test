import { NextResponse } from 'next/server';
import { scrapeWebsite } from '@/lib/scraper';
import { generateTestCases } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
    }

    // 1. URL Scraping
    const scrapedData = await scrapeWebsite(url);

    // 2. LLM Analysis
    const testCases = await generateTestCases(scrapedData);

    return NextResponse.json({ success: true, testCases });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
