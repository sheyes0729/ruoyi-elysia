type SSECleanup = () => void;

export interface SSEController {
  enqueue(data: Uint8Array): void;
  close(): void;
}

class SSEConnectionManager {
  private connections = new Map<string, SSEController>();

  register(id: string, controller: SSEController): SSECleanup {
    this.connections.set(id, controller);

    return () => {
      this.connections.delete(id);
    };
  }

  closeAll(code = 1001, reason = "Server shutting down"): void {
    const encoder = new TextEncoder();
    const message = `data: ${JSON.stringify({ type: "close", code, reason })}\n\n`;
    const encoded = encoder.encode(message);

    for (const controller of this.connections.values()) {
      try {
        controller.enqueue(encoded);
        controller.close();
      } catch {
        // ignore errors during shutdown
      }
    }

    this.connections.clear();
  }

  getActiveCount(): number {
    return this.connections.size;
  }
}

export const sseConnectionManager = new SSEConnectionManager();
