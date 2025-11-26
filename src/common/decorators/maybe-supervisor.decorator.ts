import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const MaybeSupervisor = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user;
  if (!user) return undefined;
  if (user.role === 'supervisor') return user;
  return undefined;
});
