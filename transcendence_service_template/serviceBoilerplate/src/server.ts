import closeWithGrace, { CloseWithGraceAsyncCallback } from 'close-with-grace';
import { build } from './app';

async function main() {
	const app = await build();

	const shutdownHandler: CloseWithGraceAsyncCallback = async ({ err, signal, manual }) => {
		if (!manual) {
			if (err)
				app.log.error({ err }, 'server closing due to error');
			else
				app.log.info(`${signal} received, server closing`);
		}
		await app.close();
	};
	
	const shutdown = closeWithGrace(shutdownHandler);
	
	try {
		await app.listen({
			host: '0.0.0.0',
			port: app.env.__SERVICE__SERVICE_PORT,
		});
	} catch (error) {
		app.log.error('Server failure', error);
		shutdown.close();
		shutdown.uninstall();
		process.exit(2);
	}
}

main().catch((error) => {
	console.error('User server startup error\n', error.message);
	process.exit(1);
})
