import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log({ exception });

    if (exception instanceof BadRequestException) {
      const validationErrors = exception.getResponse()['message'];
      if (Array.isArray(validationErrors)) {
        // Si hay errores de validación, devolverlos como respuesta
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          timestamp: new Date().toISOString(),
          path: request.url,
          message: 'Validation failed',
          errors: validationErrors,
        });
        return;
      }
    }

    // Si no es un error de validación, manejar como error interno del servidor
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message || 'Internal server error',
    });
  }
}
