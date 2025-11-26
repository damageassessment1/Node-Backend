import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class JsonBodyExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    // Detect common JSON parse errors from body parser (express) and return a friendlier message
    const message = exception?.message || '';
    if (typeof message === 'string' && (message.includes('Unexpected token') || message.includes('JSON'))) {
      return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: 'Invalid JSON body. Ensure Content-Type is application/json and the body is valid JSON.', data: null });
    }

    // Default: rethrow the original error
    throw exception;
  }
}
