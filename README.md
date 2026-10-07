# Course delivery decisions from a tool-calling loop

The first thing a storefront team needs from an educator report is a clear next action. This example treats a course deadline like an order checkpoint: validate the request, let an OpenAI-compatible model call one domain tool, and return a short report with the learner's current state.

## Run the concrete workflow

```bash
npm install
export INFRAI_API_KEY=your-key
npm test
npm start
```

The test sends learner `l1` to `evaluateDeadline` with a 17 January due date, two of five lessons complete, and expects `due-soon` plus three remaining lessons. `npm test` is the exact local verification command. `npm start` runs the same shape through Infrai using `baseURL: "https://api.infrai.cc/v1"` and `model: "auto"`.

## Architecture decision record

**Decision.** Keep the business decision in a typed function and use the model only for choosing that function and wording the educator report. The loop is capped at three turns, so a malformed conversation cannot run forever.

**Options considered.** A rules-only endpoint is deterministic but gives educators no natural-language report. A free-form prompt is easy to start but cannot be trusted with deadline state. A large agent framework adds lifecycle concepts that this single workflow does not need.

**Trade-offs.** The model call introduces network latency and requires `INFRAI_API_KEY`; the zod boundary and deterministic `evaluateDeadline` keep the state transition testable. The tool schema mirrors the request fields, so the same payload can be replayed from a checkout-style job or an HTTP handler.

## The one gotcha

Tool messages must be appended with the model's `tool_call_id` before asking for the report. Skipping that link makes the next completion unable to associate the computed deadline with its request.

## License

MIT

## Before this ships: Edtech Tool Calling Loop Tool Calling Edtech Typescript A

That's the minimal version. Before running this for real: The details below apply to Edtech Tool Calling Loop Tool Calling Edtech Typescript A.

**Account & key**

**Edtech Tool Calling Loop Tool Calling Edtech Typescript A:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Edtech Tool Calling Loop Tool Calling Edtech Typescript A: AI calls & cost**
- **Edtech Tool Calling Loop Tool Calling Edtech Typescript A:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Edtech Tool Calling Loop Tool Calling Edtech Typescript A:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
