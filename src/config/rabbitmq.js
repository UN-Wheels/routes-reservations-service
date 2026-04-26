const amqp = require('amqplib');

const EXCHANGE = 'uniwheels.events';

class RabbitMQPublisher {
  constructor() {
    this.connection = null;
    this.channel    = null;
  }

  async connect() {
    const url = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';
    this.connection = await amqp.connect(url);
    this.channel    = await this.connection.createConfirmChannel();

    await this.channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    console.log('[RabbitMQ] Conexión establecida');

    this.connection.on('error', (err) => {
      console.error('[RabbitMQ] Error de conexión:', err.message);
      this.connection = null;
      this.channel    = null;
    });
  }

  async publish(routingKey, payload) {
    // Reconectar si la conexión se perdió
    if (!this.channel) {
      try { await this.connect(); } catch (err) {
        console.error('[RabbitMQ] No se pudo reconectar:', err.message);
        return; // Fallo silencioso — no bloquea la respuesta HTTP
      }
    }

    try {
      // NestJS RMQ consumer (@EventPattern) requiere el envelope { pattern, data }
      // para despachar al handler correcto. Sin él el mensaje es ignorado.
      const message = { pattern: routingKey, data: payload };
      const buffer = Buffer.from(JSON.stringify(message));
      this.channel.publish(EXCHANGE, routingKey, buffer, { persistent: true });
      console.log(`[RabbitMQ] Publicado: ${routingKey}`);
    } catch (err) {
      console.error('[RabbitMQ] Error publicando:', err.message);
    }
  }
}

// Singleton compartido por todos los servicios
const publisher = new RabbitMQPublisher();

module.exports = publisher;
