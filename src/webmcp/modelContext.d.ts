declare global {
  type WebMcpTool = {
    name: string;
    title?: string;
    description: string;
    inputSchema?: Record<string, unknown>;
    annotations?: {
      readOnlyHint?: boolean;
      untrustedContentHint?: boolean;
    };
    execute: (
      input: Record<string, unknown>,
      options?: { signal?: AbortSignal },
    ) => unknown | Promise<unknown>;
  };

  type WebModelContext = {
    registerTool: (
      tool: WebMcpTool,
      options?: { signal?: AbortSignal },
    ) => void | Promise<void>;
    unregisterTool?: (name: string) => void;
  };

  interface Document {
    modelContext?: WebModelContext;
  }
  interface Navigator {
    modelContext?: WebModelContext;
  }
}

export {};
