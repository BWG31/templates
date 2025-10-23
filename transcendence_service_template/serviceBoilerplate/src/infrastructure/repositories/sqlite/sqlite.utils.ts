import sqlite3 from 'sqlite3';

export function openDatabase(
	filePath: string,
	mode: number = sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE | sqlite3.OPEN_FULLMUTEX,
): Promise<sqlite3.Database> {
	return new Promise((resolve, reject) => {
		const db = new sqlite3.Database(filePath, mode, (err) => {
			if (err)
				reject(err);
			else
				resolve(db);
		});
	});
}

export const execute = (
	db: sqlite3.Database,
	sql: string,
	params: any = []
): Promise<sqlite3.Database> => {
	if (params && params.length > 0) {
		return new Promise((resolve, reject) => {
			db.run(sql, params, (err) => {
				if (err) reject(err);
				resolve(db);
			});
		});
	} else {
		return new Promise((resolve, reject) => {
			db.exec(sql, (err) => {
				if (err) reject(err);
				resolve(db);
			})
		})
	}
};

export function getRow<T>(
	db: sqlite3.Database,
	sql: string,
	params: any = []
): Promise<T | undefined> {
	return new Promise((resolve, reject) => {
		db.get(sql, params, (err, row) => {
			if (err) reject(err);
			else resolve(row as T | undefined);
		});
	});
}

export function getAll<T>(
	db: sqlite3.Database,
	sql: string,
	params: any = []
): Promise<T[]> {
	return new Promise((resolve, reject) => {
		db.all(sql, params, (err, rows) => {
			if (err) reject(err);
			else resolve(rows as T[]);
		});
	});
}
