---
name: webmcp
description: Use when adding WebMCP to a web app — exposing its forms and actions as structured tools an in-browser AI agent can call via navigator.modelContext, instead of guessing from the screen. Covers declarative form annotation and imperative registerTool with progressive enhancement, runtime validation, and safety for destructive/outbound actions. Trigger on "add WebMCP", "modelContext", "registerTool", "expose tools to the agent", "make this page agent-operable".
---

# WebMCP

WebMCP lets a page expose **tools** to an in-browser AI agent — declaratively (annotated HTML forms) or imperatively (`navigator.modelContext.registerTool`). The agent calls your tools instead of inferring actions from pixels. It is **experimental** (Chrome origin trial / W3C draft) and the spec is moving — verify specifics against current docs (links at the bottom) before relying on exact field names.

## When to use / when not
- **Use** when user-facing operations map to clear verbs (create, add, switch, search, export) and you want agents to drive them reliably.
- **Don't** gate any normal-user functionality behind it. WebMCP is an extra lane for agents, **never the only lane**.

## Choose the API
- **Declarative — default when it fits.** Annotate existing HTML forms with `toolname` / `tooldescription` and per-field `toolparamtitle` / `toolparamdescription`. Less custom JS = less to break. Leave `toolautosubmit` **off** so the user reviews before submit.
- **Imperative.** `registerTool({ name, description, inputSchema, execute, annotations })` for actions that aren't a single form.

## Invariants (apply to both)
1. **Progressive enhancement / no-op.** Feature-detect (`'modelContext' in navigator`); if absent, do nothing. Never break unsupported browsers.
2. **Don't trust `inputSchema`.** Keep the schema loose and readable; do the real validation **inside `execute`** with clear, human-readable error messages — an agent may send anything (missing fields, wrong types, over-limit).
3. **Single source of truth.** Length limits, enums and option lists live in one shared module reused by UI, server, and tools. Never hardcode them per tool.
4. **Drive through existing handlers.** Tools call the same code paths as the UI, so auth, validation and persistence are reused and behavior can't drift. Don't fork update logic into the tool.
5. **Safety.**
   - Mark read-only tools `annotations: { readOnlyHint: true }`.
   - Mark tools that surface text from untrusted sources `annotations: { untrustedContentHint: true }`.
   - Anything that spends money / sends a message / deletes data / is hard to undo must **confirm before completing** (`requestUserInteraction`); for forms, keep `toolautosubmit` off.
   - WebMCP adds **no authentication**. Your existing auth and server-side checks still have to hold.
6. **Never crash the host app.** `registerTool` can throw (permissions policy, etc.) — wrap each call in try/catch. Unregister via an `AbortController` signal on teardown.
7. **Read the latest state through a getter/ref** so tools always see current data without re-registering on every change.

## Imperative recipe
Full template in `examples/imperative-tools.js`. Shape:
- Isolate the ambient WebMCP types in one `.d.ts` so spec churn stays in one place (declare both `navigator.modelContext` and `document.modelContext` as optional if you want to hedge).
- A `result(text)` helper returns `{ content: [{ type: "text", text }] }`.
- One factory per tool: `(get) => ({ name, description, inputSchema, annotations, async execute(input){ /* validate */ get().handler(...); return result("...") } })`.
- `registerAll(get)`: feature-detect → `AbortController` → register each tool in try/catch → return `() => controller.abort()`.
- Bind it to your framework's lifecycle: React `useEffect(() => register(() => ref.current), [])`; Vue `onMounted`/`onUnmounted`; Svelte `onMount` (return the unregister); vanilla on bootstrap + `beforeunload`.

## Declarative recipe
Template in `examples/declarative-form.html`. Annotate the form and its fields, keep server-side validation as always, and leave `toolautosubmit` off so the user reviews before sending.

## Testing
- Unit-test each `execute` against good / missing / wrong-type / over-limit input — assert both the returned text and the side effect.
- Regression: registering while `registerTool` throws must not crash the app.
- Mock `navigator.modelContext` to cover the registration path.

## References (verify — the spec is moving)
- W3C draft: https://webmachinelearning.github.io/webmcp
- Chrome origin trial docs: https://developer.chrome.com/docs/ai/webmcp
