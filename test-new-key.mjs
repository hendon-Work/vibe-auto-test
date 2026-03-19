import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyB1ExCRBSVaMAMIBjLULdF19Eng2yZLx4k');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run() {
  try {
    const result = await model.generateContent('hello');
    console.log("Success:", result.response.text());
  } catch (error) {
    console.error("Error:", error.message);
  }
}
run();
