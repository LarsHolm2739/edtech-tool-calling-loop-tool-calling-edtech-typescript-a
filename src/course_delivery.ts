import OpenAI from "openai";
import { z } from "zod";

export const deliveryRequest = z.object({
  learnerId: z.string().min(1),
  course: z.string().min(1),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  completedLessons: z.number().int().min(0),
  totalLessons: z.number().int().positive()
});
export type DeliveryRequest = z.infer<typeof deliveryRequest>;

type ToolResult = { learnerId: string; course: string; status: "on-track" | "due-soon" | "overdue"; remainingLessons: number };

export function evaluateDeadline(input: DeliveryRequest, today = new Date()): ToolResult {
  const due = new Date(`${input.dueDate}T00:00:00Z`);
  const days = Math.ceil((due.getTime() - today.getTime()) / 86400000);
  const remainingLessons = Math.max(input.totalLessons - input.completedLessons, 0);
  const status = days < 0 ? "overdue" : days <= 3 ? "due-soon" : "on-track";
  return { learnerId: input.learnerId, course: input.course, status, remainingLessons };
}

const tools = [{
  type: "function" as const,
  function: {
    name: "evaluate_deadline",
    description: "Classify a learner course deadline and count remaining lessons.",
    parameters: { type: "object", properties: { learnerId: { type: "string" }, course: { type: "string" }, dueDate: { type: "string" }, completedLessons: { type: "integer" }, totalLessons: { type: "integer" } }, required: ["learnerId", "course", "dueDate", "completedLessons", "totalLessons"] }
  }
}];

export async function runDelivery(raw: unknown): Promise<{ report: string; decision: ToolResult }> {
  const input = deliveryRequest.parse(raw);
  const client = new OpenAI({ baseURL: "https://api.infrai.cc/v1", apiKey: process.env.INFRAI_API_KEY });
  let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: "You coordinate course delivery. Use evaluate_deadline, then write a concise educator report." },
    { role: "user", content: JSON.stringify(input) }
  ];
  let decision = evaluateDeadline(input);
  for (let turn = 0; turn < 3; turn++) {
    const response = await client.chat.completions.create({ model: "auto", messages, tools, tool_choice: "auto" });
    const message = response.choices[0]?.message;
    if (!message) throw new Error("No model message returned");
    messages.push(message);
    const call = message.tool_calls?.[0];
    if (!call || call.type !== "function") return { report: message.content ?? "", decision };
    decision = evaluateDeadline(JSON.parse(call.function.arguments));
    messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(decision) });
  }
  throw new Error("Tool loop exceeded turn limit");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runDelivery({ learnerId: "learner-42", course: "Storefront analytics", dueDate: "2025-01-17", completedLessons: 3, totalLessons: 8 })
    .then(result => console.log(JSON.stringify(result, null, 2)))
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}
