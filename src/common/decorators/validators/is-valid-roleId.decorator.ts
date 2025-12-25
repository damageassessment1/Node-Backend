import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@ValidatorConstraint({ async: true })
export class IsValidTagConstraint implements ValidatorConstraintInterface {
  async validate(roleId: number, args: ValidationArguments) {

    const role = prisma.role.findUnique({
      where:{id:roleId}
    })
    return !!role
  }

  defaultMessage(args: ValidationArguments) {
    return 'Role not found.';
  }
}

export function IsValidRoleId(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidTagConstraint,
    });
  };
}
