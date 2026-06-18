import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { GeneratedStudent } from "src/auth/auth.service";
import { generateSecurePassword } from "src/common/utils/password.util";
import { parsePhaseFinalTestProgress } from "src/phase-final-test/phase-final-test-progress.util";
import { PrismaService } from "src/prisma.service";
import { StudyingPlanRegenerationService } from "src/studying-plan/studying-plan-regeneration.service";
import * as bcrypt from "bcrypt";
import { UpdateEmailDto } from "src/auth/dto/update-email.dto";
import { MailService } from "src/common/mail/mail.service";
import { UpdatePasswordDto } from "src/auth/dto/update-password.dto";

@Injectable()
export class UserProfile {
  constructor(
    private readonly prisma: PrismaService,
    private readonly studyingPlanRegeneration: StudyingPlanRegenerationService,
    private readonly mailService: MailService,
  ) {}
  async updatePassword(userId: number, dto: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Incorrect current password");
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
      },
    });

    this.mailService
      .sendPasswordChangedNotification(user.email)
      .catch((err) => {
        console.error(
          `Failed to send password changed notification to ${user.email}`,
          err,
        );
      });

    return { message: "Password successfully updated" };
  }

  async updateEmail(userId: number, dto: UpdateEmailDto) {
    const isDomainValid = await this.mailService.validateEmailDomain(
      dto.newEmail,
    );
    if (!isDomainValid) {
      throw new BadRequestException(
        "The provided email domain does not exist or cannot receive mail.",
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.newEmail },
    });

    if (existingUser) {
      throw new BadRequestException(
        "This email address is already in use by another user",
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: dto.newEmail,
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });

    return {
      success: true,
      message: "Your email address has been successfully updated!",
    };
  }
}
