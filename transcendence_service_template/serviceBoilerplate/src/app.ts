import { fastify, FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { LoggerOptions } from 'pino';
import { routes } from '@presentation/http/routes';
import { buildDependencies, DependencyList, Env } from './compositionRoot';
import { HttpController } from '@presentation/http/controller';

const opts: { logger: LoggerOptions } = {
	logger: {
		transport: {
			target: 'pino-pretty',
			options: {
				colorize: true,
				ignore: 'pid,hostname,responseTime',
				singleLine: true,
			},
		},
	},
};

declare module 'fastify' {
	interface FastifyInstance {
		env: Env,
		controller: HttpController,
		deps: DependencyList,
	}
}

export async function build() {
  const app: FastifyInstance = fastify(opts);
  const { env, useCases, deps } = await buildDependencies();

  app.decorate('env', env);
  app.decorate('controller', new HttpController(useCases));
  app.decorate('deps', deps);
  app.setErrorHandler(customErrorHandler);
  app.addHook('onClose', closeRoutine);
  app.register(routes);
  await initRepos(deps);

  return app;
}

async function initRepos(deps: DependencyList) {
	// init any repos here
}

function closeRoutine(app: FastifyInstance) {
	//	Close DB connection when added
	// app.log.info('Closing repo connection');
	// app.deps.db.close((error) => {
	// 	app.log.warn('Failed to close database:', error);
	// });
	app.log.info('Closing fastify instance');
}

function customErrorHandler(
	error: FastifyError,
	request: FastifyRequest,
	reply: FastifyReply
) {
	const code = error.statusCode?? 500;
	if (code < 500)
		return reply.code(code).send({error: error.message});
	request.log.error(error);
	return reply.code(code).send({ error: 'Unexpected error please try again' });
}
