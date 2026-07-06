import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  let city = "";
  let weather_context: any = {};
  let message = "";

  try {
    const body = await request.json();
    city = body.city;
    weather_context = body.weather_context || {};
    message = body.message;

    if (!city || !message) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_PARAMS',
            message: 'City and message fields are required in the request body.',
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    // Context formatting
    const contextString = JSON.stringify(weather_context || {});

    // Removed client-provided key; use server env only
    const activeGeminiKey = GEMINI_API_KEY;

    // If Gemini key is not set, run a rule-based mock response
    if (!activeGeminiKey) {
      return NextResponse.json({
        reply: generateLocalAiReply(city, weather_context, message),
      });
    }

    console.log("Gemini key exists:", !!activeGeminiKey);
    console.log("Gemini key prefix:", activeGeminiKey?.substring(0, 6));

    const ai = new GoogleGenAI({ apiKey: activeGeminiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are "Atmos", a helpful, conversational, premium AI weather assistant.
You provide precise, friendly weather advice. Keep your response brief and to the point (maximum 2-3 sentences).
Always answer in a natural, friendly tone. Do not use Markdown headings or lists, just plain text.
Here is the current weather context for the city of ${city}:
${contextString}

Answer the following question from the user based on this context. If the question is completely unrelated to weather, geography, or plans affected by the weather, politely guide the conversation back to the weather.
User question: "${message}"`,
    });

    const replyText = response.text?.trim() || '';

    return NextResponse.json({ reply: replyText });
  } catch (error: unknown) {
    // If the Gemini API call fails (e.g., invalid/missing key), gracefully
    // fall back to the local rule-based reply so the chat always works.
    console.error("Gemini Error:", error);
    return NextResponse.json({
      reply: generateLocalAiReply(city, weather_context, message),
    });
  }
}

/**
 * Generate a high-quality local rule-based response when GEMINI_API_KEY is not configured.
 */
function generateLocalAiReply(city: string, context: any, message: string): string {
  const msg = message.toLowerCase();
  const current = context?.current || {};
  const temp = current.temp || 20;
  const condition = current.condition || 'Clear';
  const precipChance = context?.forecast?.hourly?.[0]?.precip_chance || 0;

  let reply = ``;

  if (msg.includes('rain') || msg.includes('umbrella') || msg.includes('wet')) {
    if (precipChance > 30 || condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('storm')) {
      reply += `Yes, you will likely need an umbrella in ${city}. The current condition is ${condition} with a high chance of rain.`;
    } else {
      reply += `No umbrella should be needed in ${city} right now! The conditions are ${condition} with a very low chance of rain.`;
    }
  } else if (msg.includes('wear') || msg.includes('clothes') || msg.includes('jacket') || msg.includes('clothing')) {
    if (temp < 12) {
      reply += `It's quite cold in ${city} (${temp}°C). I'd recommend wearing a heavy coat, scarf, and layering up to stay warm!`;
    } else if (temp < 20) {
      reply += `The temperature in ${city} is currently a mild ${temp}°C. A light jacket or sweater should keep you comfortable.`;
    } else {
      reply += `It is warm in ${city} (${temp}°C). Light cotton shirts and shorts are perfect for today.`;
    }
  } else if (msg.includes('run') || msg.includes('outside') || msg.includes('outdoor') || msg.includes('activity')) {
    const score = context?.weather_score || 80;
    if (score > 70) {
      reply += `It's a great day for outdoor activities in ${city}! The Weather Score is ${score}/100 with ${condition} skies.`;
    } else {
      reply += `Conditions aren't ideal in ${city} (Weather Score: ${score}/100). You might want to consider indoor activities today.`;
    }
  } else if (msg.includes('travel') || msg.includes('drive') || msg.includes('flight')) {
    if (condition.toLowerCase().includes('storm') || condition.toLowerCase().includes('fog') || condition.toLowerCase().includes('snow')) {
      reply += `Please be careful traveling in ${city}. The current ${condition} might cause visibility issues or delays.`;
    } else {
      reply += `Travel looks clear and safe in ${city} today under ${condition} skies!`;
    }
  } else {
    reply += `In ${city}, it is currently ${temp}°C and ${condition}. Let me know if you want tips on clothing, outdoor activities, or travel!`;
  }

  return reply;
}
