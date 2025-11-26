import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    // Debug: AllExceptionsFilter invoked
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let data = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'string') {
        message = response;
      } else if (response && typeof response === 'object') {
        // If the response object already matches our API shape, pass through
        if ('success' in response && 'message' in response) {
          return res.status(status).json(response);
        }
        message = response['message'] || message;
        data = response['data'] ?? null;
      }
    } else if (exception && exception.message) {
      message = exception.message;
    }

    res.status(status).json({ success: false, message, data });
  }
}
