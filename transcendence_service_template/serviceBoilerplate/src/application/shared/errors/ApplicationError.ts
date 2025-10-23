export abstract class ApplicationError extends Error {
	abstract readonly code: string;
	abstract readonly type: 'VALIDATION' | 'CONFLICT' | 'NOT_FOUND' | 'AUTHORIZATION' | 'BUSINESS_RULE' | 'EXTERNAL_DEPENDENCY' | 'SYSTEM';

	constructor(
		message: string,
		readonly details?: string
	) {
		super(message);
		this.name = this.constructor.name;
	}
}

export class ValidationError extends ApplicationError {
	readonly code = 'VALIDATION_ERROR';
	readonly type = 'VALIDATION' as const;

	constructor(
		readonly field: string,
		readonly rule: string,
		details?: string
	) {
		super(`Validation failed for field '${field}': ${rule}`, details);
	}
}

export class ConflictError extends ApplicationError {
	readonly code = 'CONFLICT_ERROR';
	readonly type = 'CONFLICT' as const;

	constructor(
		readonly field: string,
		details?: string
	) {
		super(`Conflict detected for field '${field}'`, details);
	}
}

export class NotFoundError extends ApplicationError {
	readonly code = 'NOT_FOUND_ERROR';
	readonly type = 'NOT_FOUND' as const;

	constructor(
		readonly key: string
	){
		super(`Resource with key '${key}' not found`);
	}
}

export class UnavailableError extends ApplicationError {
	readonly code = 'EXTERNAL_DEPENDENCY_UNAVAILABLE';
	readonly type = 'EXTERNAL_DEPENDENCY' as const;

	constructor(
		readonly dependency: string,
		details?: string
	) {
		super(`External dependency '${dependency}' is unavailable`, details);
	}
}

export class BusinessRuleViolationError extends ApplicationError {
	readonly code = 'BUSINESS_RULE_VIOLATION';
	readonly type = 'BUSINESS_RULE' as const;

	constructor(
		readonly rule: string
	) {
		super(`Business rule violation: ${rule}`);
	}
}

export class UnauthorizedError extends ApplicationError {
	readonly code = 'UNAUTHORIZED';
	readonly type = 'AUTHORIZATION' as const;

	constructor() {
		super('Authentication required');
	}
}

export class ForbiddenError extends ApplicationError {
	readonly code = 'FORBIDDEN';
	readonly type = 'AUTHORIZATION' as const;

	constructor() {
		super('Access forbidden');
	}
}

export class UnknownError extends ApplicationError {
	readonly code = 'UNKNOWN_ERROR';
	readonly type = 'SYSTEM' as const;

	constructor(
		readonly error: any,
		details?: string
	) {
		super('An unexpected error occurred', details || JSON.stringify(error));
	}
}

export class CorruptDataError extends ApplicationError {
	readonly code = 'CORRUPT_DATA_ERROR';
	readonly type = 'SYSTEM' as const;

	constructor(
		readonly userId: string,
		readonly field: string,
		readonly rule: string
	) {
		super(`Data corruption detected for user ${userId}, field '${field}': ${rule}`);
	}
}
