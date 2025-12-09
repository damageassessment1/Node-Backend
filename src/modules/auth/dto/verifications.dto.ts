import { IsNotEmpty, IsNumber, IsNumberString, IsString } from "class-validator";

export class VerifyIdDto {
  @IsNotEmpty({ message: "الرقم الوطني مطلوب" })
  @IsNumberString({}, { message: "الرقم الوطني يجب أن يكون رقم" })
  nationalId: string;
}

export class VerifyQuestionsDto {
  @IsString({message:"الرقم الوطني يجب أن يكون رقم"})
  @IsNotEmpty({message:"الرقم الوطني مطلوب"})
  nationalId: string;

  @IsNotEmpty({message:"يجب تقديم الاجوبة"})
  answers: Record<string, string>;
}

export class CompleteSignupDto {
  @IsString({message:"الرقم الوطني يجب أن يكون رقم"})
  @IsNotEmpty({message:"الرقم الوطني مطلوب"})
  nationalId: string;

  @IsString({message:"الاسم الأول يجب أن يكون نص"})
  @IsNotEmpty({message:"الاسم الأول مطلوب"})
  firstName: string;

  @IsString({message:"اسم الأب يجب أن يكون نص"})
  @IsNotEmpty({message:"اسم الأب مطلوب"})
  fatherName: string;

  @IsString({message:"اسم الجد يجب أن يكون نص"})
  @IsNotEmpty({message:"اسم الجد مطلوب"})
  grandfatherName: string;

  @IsString({message:"اسم العائلة يجب أن يكون نص"})
  @IsNotEmpty({message:"اسم العائلة مطلوب"})
  familyName: string;

  @IsNumberString({}, {message:"رقم الهاتف يجب أن يكون رقم"})
  @IsNotEmpty({message:"رقم الهاتف مطلوب"})
  phoneNumber: string;

  @IsString({message:"كلمة المرور يجب أن تكون نص"})
  @IsNotEmpty({message:"كلمة المرور مطلوبة"})
  password: string;
}

export class CitizenLoginDto {
  @IsString({message:"الرقم الوطني يجب أن يكون رقم"})
  @IsNotEmpty({message:"الرقم الوطني مطلوب"})
  nationalId: string;

  @IsString({message:"كلمة المرور يجب أن تكون نص"})
  @IsNotEmpty({message:"كلمة المرور مطلوبة"})
  password: string;
}
