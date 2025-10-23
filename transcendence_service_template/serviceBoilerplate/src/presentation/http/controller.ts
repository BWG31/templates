import { ApplicationError } from "@application/shared/errors/ApplicationError";
import { __Service__UseCases } from "@application/useCases/__Service__UseCasesFactory";
import { FastifyReply, FastifyRequest } from "fastify";
import { mapAppErrorToHttp } from "./mappers/mapAppErrToHttp";

export interface IHttpController {
	// define methods
}

export class HttpController implements IHttpController {
	constructor(
		private readonly useCases: __Service__UseCases
	) {}


	//	===== HELPERS =====
	private handleError(request: FastifyRequest, reply: FastifyReply, error: ApplicationError) {
		mapAppErrorToHttp(error, reply);
		if (reply.statusCode >= 500)
			request.server.log.error(error);
		else
			request.server.log.debug(error);
	}
}