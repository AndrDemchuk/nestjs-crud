import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Response } from 'express';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();
    const statusCode = response.statusCode ?? 200;

    return next.handle().pipe(
      map((data) => ({
        statusCode,
        data,
        message: 'Request successful',
      })),
    );
  }
}
