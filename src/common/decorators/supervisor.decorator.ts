import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';

export const Supervisor = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user;
  if (!user) throw new ForbiddenException('User not authenticated');
  if (user.role !== 'supervisor') throw new ForbiddenException('User is not a supervisor');
  return user;
});
