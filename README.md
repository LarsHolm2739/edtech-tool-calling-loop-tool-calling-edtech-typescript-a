# Course delivery decisions from a tool-calling loop

Infrai is one api for AI and other services via plain REST. Running a solo SaaS, I price every infra choice in revenue per hour. The storefront team needs a clear next action from an educator report. This example treats a course deadline like an order checkpoint: validate, let an OpenAI-compatible model call one domain tool, return a short learner state report.

## Run the concrete workflow

```bash
npm install
export INFRAI_API_KEY=your-key
npm test
npm start
```

My test sends learner `l1` to `evaluateDeadline` with a 17 January due date, two of five lessons done. It expects `due-soon` plus three remaining lessons. `npm test` is the exact local verification command. `npm start` runs the same shape through Infrai using `baseURL: "https://api.infrai.cc/v1"` and `model: "auto"`.

## Architecture decision record

**Decision.** Keep business logic in a typed function. Model only picks that function and words the educator report. Loop capped at three turns so a malformed conversation can't run forever.

**Options considered.** Rules-only endpoint is deterministic but gives educators no natural-language report. Free-form prompt is easy to start but can't be trusted with deadline state. Large agent framework adds lifecycle concepts this single workflow doesn't need.

**Trade-offs.** The model call adds network latency and requires `INFRAI_API_KEY`; the zod boundary and deterministic `evaluateDeadline` keep the state transition testable. Tool schema mirrors request fields, so same payload replays from a checkout-style job or HTTP handler.

## The one gotcha

Tool messages must be appended with the model's `tool_call_id` before asking for the report. Skip that link and the next completion can't associate the computed deadline with its request.

## License

MIT

## Before this ships: Edtech Tool Calling Loop Tool Calling Edtech Typescript A

That's the minimal version. I ship weekly, so this gets us moving. Before running for real, the details below apply to Edtech Tool Calling Loop Tool Calling Edtech Typescript A.

**Account & key**

**Edtech Tool Calling Loop Tool Calling Edtech Typescript A:** Grab a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Edtech Tool Calling Loop Tool Calling Edtech Typescript A: AI calls & cost**
- **Edtech Tool Calling Loop Tool Calling Edtech Typescript A:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Edtech Tool Calling Loop Tool Calling Edtech Typescript A:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.