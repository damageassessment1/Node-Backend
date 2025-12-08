import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class KeepAliveService {
  private readonly logger = new Logger(KeepAliveService.name);

  constructor(private readonly http: HttpService) {}

  // Runs every 10 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async pingServer() {
    const url = `https://backend-6adn.onrender.com/keep-alive`;
    const frontUrl = "https://gazadamageassessments.onrender.com";
    try {
      const res = await firstValueFrom(this.http.get(url));
      const front = await firstValueFrom(this.http.get(frontUrl));
      this.logger.log(`Pinged ${url}, data: ${res.data.data}`);
      this.logger.log(`Pinged ${front}, data: ${front.data}`);
    } catch (err) {
      this.logger.error(`Failed to ping ${url}: ${err.message}`);
    }
  }
}
