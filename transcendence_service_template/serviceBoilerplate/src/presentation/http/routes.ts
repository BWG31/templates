import { FastifyInstance } from "fastify";

export async function routes(app: FastifyInstance) {
	app.get('/public/health', async () => ({ status: 'ok', service: '__service__-service' }));
}
