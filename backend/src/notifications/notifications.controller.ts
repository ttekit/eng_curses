import { Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post("send-daily-test")
  @HttpCode(HttpStatus.OK)
  async triggerTestReminder() {
    await this.notificationsService.sendDailyReminders();
    return { message: "Daily reminders triggered successfully" };
  }

  @Post("send-weekly-test")
  @HttpCode(HttpStatus.OK)
  async triggerWeeklyReport() {
    await this.notificationsService.sendWeeklyReports();
    return { message: "Weekly reports triggered successfully" };
  }
}
