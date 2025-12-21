import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";


@Injectable()
export class UploadsValidationPipe implements PipeTransform {
  transform(
    uploads: Record<string, Express.Multer.File[]>
  ): Record<string, Express.Multer.File[]> {
    if (!uploads) return uploads;

    const MAX_SIZE = 1024 * 1024 * 5;  // 5MB
    const allowedTypes = ["application/pdf","image/jpeg", "image/png"];

    for (const [field, files] of Object.entries(uploads)) {
      if (!Array.isArray(files) || files.length === 0) continue;

      // Validate count
      if (field === "beforeWarImage" && files.length > 1) {
        throw new BadRequestException("beforeWarImage max 1 file");
      }
      if (field === "afterWarImage" && files.length > 1) {
        throw new BadRequestException("afterWarImage max 1 file");
      }
      if (field === "ownershipDocuments" && files.length > 5) {
        throw new BadRequestException("ownershipDocuments max 5 files");
      }

      // Validate each file
      files.forEach((file, index) => {
        if (file.size > MAX_SIZE) {
          throw new BadRequestException(`${field}[${index}] exceeds 1MB`);
        }

        if (field === "beforeWarImage" || field === "afterWarImage") {
          if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException(
              `${field}[${index}] must be JPEG or PNG`
            );
          }
        }

        if (field === "ownershipDocuments") {
          if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException(
              `${field}[${index}] must be a PDF`
            );
          }
        }
      });
    }

    return uploads;
  }
}
