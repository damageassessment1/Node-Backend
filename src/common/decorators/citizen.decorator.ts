import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const Citizen = createParamDecorator(
  (data, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().citizen
);
