import { GoogleGenerativeAI } from '@google/generative-ai';
import { ScrapedData } from './scraper';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

export async function generateTestCases(data: ScrapedData): Promise<TestCase[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set. Please configuring an API Key.');
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are an expert QA Automation Engineer. Based on the scraped web page data provided below, generate a comprehensive list of Quality Assurance (QA) Test Cases. 
Identify the core user journeys (like login, navigation, search, checkout) and write test cases for them.
Please write all the content (depths, precondition, test step, expected result) in KOREAN (한국어).
Return ONLY a raw JSON array of objects without markdown block formatting or any extra text.

Format each test case object precisely like this:
{
  "no": "1",
  "url": "${data.url}",
  "depth1": "메인 페이지",
  "depth2": "로그인",
  "depth3": "이메일 로그인",
  "depth4": "유효한 계정",
  "depth5": "로그인 버튼 클릭",
  "precondition": "사용자가 로그인 페이지에 진입한 상태",
  "testStep": "1. 유효한 이메일 입력\\n2. 유효한 비밀번호 입력\\n3. 로그인 버튼 클릭",
  "expectedResult": "대시보드 페이지로 정상적으로 이동해야 함",
  "result": ""
}

Scraped Page Title: ${data.title}
Interactive Elements (buttons, inputs, links, etc):
${JSON.stringify(data.interactives.slice(0, 150), null, 2)}

Body Text Snippet:
${data.bodyText.substring(0, 3000)}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Try to parse the JSON array out of the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return JSON.parse(text);
  } catch (error: any) {
    console.error("AI Generation failed:", error);
    throw new Error(`AI processing failed: ${error.message}`);
  }
}
