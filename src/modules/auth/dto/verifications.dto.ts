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
