class PaymentStreamService {
  constructor() {
    this.clients = new Map();
  }

  subscribe(orderId, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    res.write(':\n\n');

    const keepAlive = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 15000);

    const client = { res, keepAlive };

    if (!this.clients.has(orderId)) {
      this.clients.set(orderId, new Set());
    }
    this.clients.get(orderId).add(client);

    res.on('close', () => {
      clearInterval(keepAlive);
      const set = this.clients.get(orderId);
      if (set) {
        set.delete(client);
        if (set.size === 0) this.clients.delete(orderId);
      }
    });

    return client;
  }

  push(orderId, data) {
    const set = this.clients.get(orderId);
    if (!set || set.size === 0) return 0;

    const payload = `data: ${JSON.stringify(data)}\n\n`;
    let sent = 0;

    for (const client of set) {
      try {
        client.res.write(payload);
        sent++;
      } catch {
        // Client disconnected, cleanup handled by 'close' event
      }
    }

    return sent;
  }

  getClientCount(orderId) {
    return this.clients.get(orderId)?.size || 0;
  }
}

module.exports = new PaymentStreamService();
