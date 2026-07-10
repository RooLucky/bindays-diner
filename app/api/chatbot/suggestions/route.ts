import { getFeaturedChatbotQuestions } from "@/lib/chatbot/knowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const suggestions = await getFeaturedChatbotQuestions();
    return Response.json({ suggestions });
  } catch {
    return Response.json({ suggestions: [] });
  }
}
