# webmcp-skill

**English** | [日本語](./README.md)

A Claude Code plugin that teaches the agent how to add **WebMCP** to a web app — exposing its forms and actions as structured tools an in-browser AI agent can call via `navigator.modelContext`, instead of guessing from the screen.

It covers both integration styles (declarative form annotation and imperative `registerTool`) and bakes in the safety defaults: progressive enhancement (no-op on unsupported browsers), runtime validation, single-source limits, and confirmation for destructive/outbound actions.

## Install

```sh
claude plugin marketplace add hayashiii-ghub/webmcp-skill
claude plugin install webmcp@webmcp-skill
```

Local testing before publishing:

```sh
claude plugin marketplace add ./webmcp-skill
```

## Usage

Open your site's codebase in Claude Code and ask, e.g.:

> Add WebMCP to my contact page.

The skill guides the implementation: which API to use, how to annotate forms / register tools, how to keep sensitive actions safe, and how to make sure nothing breaks for visitors whose browser doesn't support WebMCP yet.

## What's inside

```
webmcp/
  .claude-plugin/plugin.json
  skills/webmcp/
    SKILL.md                       # the guidance the agent reads
    examples/
      imperative-tools.js          # registerTool template (read-only / mutating / confirm)
      declarative-form.html        # annotated form template
```

## Notes

- WebMCP is **experimental** (Chrome origin trial / W3C draft). The spec is moving — the skill points the agent at the current references and tells it to verify exact field/method names.
- The patterns are distilled from a production imperative WebMCP implementation. Related prior art: the W3C draft (https://webmachinelearning.github.io/webmcp) and Chrome's docs (https://developer.chrome.com/docs/ai/webmcp), and the `getmasset/webmcp-skill` plugin.

## License

MIT
