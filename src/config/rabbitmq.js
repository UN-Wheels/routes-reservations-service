const amqp = require('amqplib');

const EXCHANGE = 'uniwheels.events';

const RECONNECT_DELAY_MS = 5000;

class RabbitMQPublisher {
  constructor() {
    this.connection  = null;
    this.channel     = null;
    this.reconnecting = false;
  }

  scheduleConnect(delayMs) {
    if (this.reconnecting) return;
    this.reconnecting = true;
    setTimeout(() => {
      this.connect()
        .then(() => { this.reconnecting = false; })
        .catch((err) => {
          this.reconnecting = false;
          console.error('[RabbitMQ] Reintento fallo:', err.message);
          this.scheduleConnect(RECONNECT_DELAY_MS);
        });
    }, delayMs);
  }

  async connect() {
    const url = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';
    // heartbeat=30 evita que la conexion TCP quede idle y se corte tras unos minutos.
    this.connection = await amqp.connect(url, { heartbeat: 30 });
    this.channel    = await this.connection.createConfirmChannel();

    await this.channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    console.log('[RabbitMQ] Conexión establecida');

    const onLost = (reason) => (err) => {
      console.error(`[RabbitMQ] Conexion ${reason}:`, err?.message ?? 'sin detalle');
      this.connection = null;
      this.channel    = null;
      this.scheduleConnect(RECONNECT_DELAY_MS);
    };
    this.connection.on('error', onLost('error'));
    this.connection.on('close', onLost('close'));
  }

  async publish(routingKey, payload) {
    if (!this.channel) {
      console.warn(`[RabbitMQ] Canal no disponible al publicar ${routingKey}; reintentando conexion`);
      this.scheduleConnect(0);
      return;
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
      this.scheduleConnect(RECONNECT_DELAY_MS);
    }
  }
}

// Singleton compartido por todos los servicios
const publisher = new RabbitMQPublisher();

module.exports = publisher;
