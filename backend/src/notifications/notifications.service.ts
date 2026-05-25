// src/notifications/notifications.service.ts
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "src/prisma.service";
import { MailService } from "../common/mail/mail.service";
import * as React from "react";
import { DailyReminderTemplate } from "../common/mail/templates/daily-reminder.template";
import { WeeklyReportTemplate } from "../common/mail/templates/weekly-report.template";

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendDailyReminders() {
    const users = await this.prisma.user.findMany({
      where: { dailyReminderEnabled: true },
    });

    for (const user of users) {
      await this.mailService.sendNotification(
        user.email,
        "Daily Study Reminder 📚",
        React.createElement(DailyReminderTemplate, { name: user.name }),
      );
    }
  }

  @Cron("0 9 * * 1")
  async sendWeeklyReports() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const users = await this.prisma.user.findMany({
      where: { weeklyReportEnabled: true },
      include: {
        watchSessions: {
          where: { endedAt: { gte: oneWeekAgo } },
        },
      },
    });

    for (const user of users) {
      const totalSeconds = user.watchSessions.reduce(
        (sum, session) => sum + session.secondsWatched,
        0,
      );
      const totalMinutes = Math.floor(totalSeconds / 60);
      const completedCount = user.watchSessions.filter(
        (session) => session.completed,
      ).length;

      await this.mailService.sendNotification(
        user.email,
        "Your Weekly Learning Report 📊",
        React.createElement(WeeklyReportTemplate, {
          name: user.name,
          stats: { minutes: totalMinutes, completed: completedCount },
        }),
      );
    }
  }
}
