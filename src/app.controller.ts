import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { Public } from "./common/decorators/public-endpoint.decorator";

@Controller("")
export class AppController {
  constructor(private readonly service: AppService) {}

  @Get("/keep-alive")
  @Public()
  keepAlive() {
    return "Server is running";
  }


}
