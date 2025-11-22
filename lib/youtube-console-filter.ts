// Filter out annoying YouTube origin mismatch errors
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const firstArg = args[0];
    const message = firstArg?.toString() || "";
    const stack = (firstArg as Error)?.stack?.toString() || "";

    // Filter out YouTube origin mismatch errors
    if (
      message.includes("origins don't match") ||
      (message.includes("youtube.com") && message.includes("localhost"))
    ) {
      // Silently ignore these errors
      return;
    }

    // Filter out browser extension errors (content_script.js)
    if (
      stack.includes("content_script.js") ||
      stack.includes("chrome-extension://") ||
      message.includes("content_script.js")
    ) {
      // Silently ignore browser extension errors
      return;
    }

    // Log all other errors normally
    originalError.apply(console, args);
  };
}

export {};
