export let Uuid: typeof import("uuid") | undefined;
try {
  Uuid = await import("uuid");
} catch (_e) {}
