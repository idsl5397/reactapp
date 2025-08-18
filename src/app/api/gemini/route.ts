import { NextRequest } from "next/server";
import {GoogleGenAI} from "@google/genai";


let ai: GoogleGenAI | null = null;

function getGeminiAI() {
  if (!ai) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.replace(/^=+/, '');

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API Key 未設定');
    }

    ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY
    });
  }
  return ai;
}

export async function POST(request: NextRequest) {
  try {
    const geminiAI = getGeminiAI();

    // 正確讀取 request body
    const body = await request.json();
    const userText = body.text || body.message || '';

    // 正確的 API 調用方式
     const result = await geminiAI.models.generateContent({
          model: "gemini-2.0-flash-exp",
          contents: [{
            role: "user",
            parts: [{
              text: `你是一個專業的績效指標平台小幫手。請針對以下問題提供專業且友善的回覆：${userText}`
            }]
          }]
        });

    return Response.json({
      response: result.text
    });

  } catch (error) {
    console.error('Gemini API 錯誤:', error);

    return Response.json({
      error: error instanceof Error ? error.message : '未知錯誤'
    }, {
      status: 500
    });
  }
}
