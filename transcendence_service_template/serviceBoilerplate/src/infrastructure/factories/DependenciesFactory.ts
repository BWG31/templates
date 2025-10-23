import { Env } from '@root/compositionRoot';
import sqlite3 from 'sqlite3';
import { openDatabase } from '@infrastructure/repositories/sqlite/sqlite.utils';
import { IUniqueIdGenerator } from '@application/providers/IUniqueIdGenerator';
import { UniqueIdGenerator } from '@infrastructure/providers/UniqueIdGenerator';

export interface DependencyList {
	idGenerator: IUniqueIdGenerator,
};

export class DependenciesFactory {
	public static readonly TABLE_NAMES = {
		TEST: 'testTable' // placeholder
	} as const;
	
	static async create(env: Env): Promise<DependencyList> {

		const idGenerator = new UniqueIdGenerator();
		
		return {
			idGenerator,
		};
	}

	static validateEnvironment(env: Env): void {
		const required = ['SQLITE_FILE']; // Numerical values cannot be handled this way!
		const missing = required.filter(key => !env[key as keyof Env]);
		
		if (missing.length > required.length)
			throw new Error(`Missing required environment variables: ${missing.join(', ')}`);

		if (env.__SERVICE__SERVICE_PORT == null || isNaN(env.__SERVICE__SERVICE_PORT))
			throw new Error(`__SERVICE__SERVICE_PORT is required and must be a valid number`);

		if (env.__SERVICE__SERVICE_PORT < 0 || env.__SERVICE__SERVICE_PORT > 0xFFFF)
			throw new Error(`Invalid __SERVICE__SERVICE_PORT: ${env.__SERVICE__SERVICE_PORT}`);
	}
}

export class DatabaseFactory {
	static async create(filePath: string): Promise<sqlite3.Database> {
		return await openDatabase(filePath);
	}
}
	