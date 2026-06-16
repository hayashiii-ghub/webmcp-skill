// WebMCP imperative tools — framework-agnostic template.
//
// Principles encoded here:
//  - progressive enhancement: no-op when the browser lacks modelContext
//  - don't trust inputSchema: validate inside execute, clear error text
//  - single source of truth for limits (share LIMITS with UI + server)
//  - drive through the app's existing handlers (get().*)
//  - readOnlyHint / untrustedContentHint annotations
//  - confirm destructive/outbound actions before completing
//  - never crash the host app (try/catch); unregister via AbortController
//
// NOTE: WebMCP is experimental and the spec moves. Verify exact field/method
// names (e.g. the confirmation API) against the current origin-trial docs.

const LIMITS = { itemName: 50 }; // ← share this module with UI + server, don't hardcode per tool

const result = (text) => ({ content: [{ type: "text", text }] });
const asStr = (v) => (typeof v === "string" ? v.trim() : ""); // loose coercion; real check below

function buildTools(get) {
  return [
    // ── read-only ──
    {
      name: "list_items",
      description: "List the current items.",
      annotations: { readOnlyHint: true },
      async execute() {
        const items = get().items;
        return result(items.length ? items.join(", ") : "(empty)");
      },
    },

    // ── mutating: validate in execute, act via the UI's own handler ──
    {
      name: "add_item",
      description: "Add a new item to the list.",
      inputSchema: {
        type: "object",
        properties: { name: { type: "string" } },
        required: ["name"],
      },
      annotations: { readOnlyHint: false },
      async execute(input) {
        const name = asStr(input?.name);
        if (!name) return result("Name is empty.");
        if (name.length > LIMITS.itemName) {
          return result(`Name must be ${LIMITS.itemName} characters or fewer.`);
        }
        get().addItem(name); // same path the UI calls — reuses validation/persistence
        return result(`Added "${name}".`);
      },
    },

    // ── destructive: confirm before completing ──
    {
      name: "clear_items",
      description: "Remove all items. Asks the user to confirm first.",
      annotations: { readOnlyHint: false },
      async execute(_input, client) {
        // Verify the exact confirmation API against current docs; guarded so a
        // missing method just cancels rather than throwing.
        const ok = await client?.requestUserInteraction?.("Clear all items?");
        if (!ok) return result("Cancelled.");
        get().clearItems();
        return result("Cleared all items.");
      },
    },
  ];
}

/**
 * Register all tools. Returns an unregister function.
 * No-op (returns a no-op unregister) when WebMCP is unsupported.
 */
export function registerAppTools(get) {
  const mc = navigator.modelContext; // origin-trial API (hedge with document.modelContext if needed)
  if (!mc) return () => {};
  const controller = new AbortController();
  for (const tool of buildTools(get)) {
    try {
      mc.registerTool(tool, { signal: controller.signal });
    } catch (err) {
      // registerTool may throw (permissions policy, etc.) — never crash the app.
      console.warn(`[webmcp] registerTool failed: ${tool.name}`, err);
    }
  }
  return () => controller.abort();
}

// ── Wiring examples ──
// React:   useEffect(() => registerAppTools(() => stateRef.current), [])
// Vue:     onMounted(() => { off = registerAppTools(() => store.state) }); onUnmounted(() => off())
// Svelte:  onMount(() => registerAppTools(getState))   // return value unregisters
// Vanilla: const off = registerAppTools(getState); addEventListener("beforeunload", off)
