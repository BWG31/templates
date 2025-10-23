import {
	ApplicationError,
	ValidationError,
	ConflictError,
	NotFoundError,
	UnauthorizedError,
	ForbiddenError,
	UnavailableError,
	BusinessRuleViolationError,
	UnknownError,
	CorruptDataError
 } from "@application/shared/errors/ApplicationError";
import { FastifyReply } from "fastify";


export function mapAppErrorToHttp(error: ApplicationError, reply: FastifyReply) {
	if (error instanceof ValidationError)
		return reply.code(400).send({ field: error.field, rule: error.rule });
	if (error instanceof ConflictError)
		return reply.code(409).send({ field: error.field });
	if (error instanceof NotFoundError)
		return reply.code(404).send({ key: error.key });
	if (error instanceof UnauthorizedError)
		return reply.code(401).send({ message: 'Unauthorized' });
	if (error instanceof ForbiddenError)
		return reply.code(403).send({ message: 'Forbidden' });
	if (error instanceof UnavailableError)
		return reply.code(503).send({ message: 'Service temporarily unavailable' });
	if (error instanceof BusinessRuleViolationError)
		return reply.code(418).send({ message: 'I\'m a teapot!' });
	if (error instanceof UnknownError)
		return reply.code(500).send({ message: 'An unexpected error occurred, please try again' });
	if (error instanceof CorruptDataError)
		return reply.code(500).send({ message: 'Something went wrong, please contact a service admin' });
	return reply.code(500).send({ message: 'Oops, please try again' });
}