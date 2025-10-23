import { load, EnvType } from 'ts-dotenv';
import { __Service__UseCases, __Service__UseCasesFactory } from '@application/useCases/__Service__UseCasesFactory';
import { DependenciesFactory, DependencyList } from '@infrastructure/factories/DependenciesFactory';

export type { DependencyList };

const schema = {
	__SERVICE__SERVICE_PORT: Number,
	SQLITE_FILE: String
}

export type Env = EnvType<typeof schema>;

export async function buildDependencies() {
	const env = load(schema);
	DependenciesFactory.validateEnvironment(env);
	const deps: DependencyList = await DependenciesFactory.create(env);
	const useCases: __Service__UseCases = __Service__UseCasesFactory.create(deps);
	return { env, useCases, deps };
}