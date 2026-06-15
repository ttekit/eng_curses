import { Injectable, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import * as bcrypt from "bcrypt";
import { generateSecurePassword } from "src/common/utils/password.util";
import { AuthMethod, UserRole } from "@generated/prisma/enums";
import { TeacherStudentQuizRow, TeacherStudentResultRow } from "./types";

@Injectable()
export class TeacherStudentsService {
  constructor(private readonly prisma: PrismaService) {}
  
  async addStudent(
    teacherId: number,
    data: { name: string; email: string; classId?: number },
  ) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ForbiddenException("A user with this email already exists");
    }

    if (data.classId) {
      const classExists = await this.prisma.class.findFirst({
        where: { id: data.classId, teacherId },
      });
      if (!classExists) {
        throw new ForbiddenException(
          "The specified class was not found or does not belong to you.",
        );
      }
    }

    const tempPassword = generateSecurePassword(16);

    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const created = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: UserRole.STUDENT,
        method: AuthMethod.CREDENTIALS,
        teacherId: teacherId,
        classId: data.classId || null,
        isVerified: true,
      },
    });

    return { student: created, tempPassword };
  }

  async updateStudent(
    teacherId: number,
    studentId: number,
    data: { name: string; email: string },
  ) {
    const student = await this.prisma.user.findFirst({
      where: { id: studentId, teacherId },
    });
    if (!student)
      throw new ForbiddenException("Student not found or not assigned to you");

    return this.prisma.user.update({
      where: { id: studentId },
      data: { name: data.name, email: data.email },
    });
  }

  async removeStudent(teacherId: number, studentId: number) {
    const student = await this.prisma.user.findFirst({
      where: { id: studentId, teacherId },
    });
    if (!student) throw new ForbiddenException("Student not found");

    return this.prisma.user.delete({
      where: { id: studentId },
    });
  }

  async resetStudentPassword(teacherId: number, studentId: number) {
    const student = await this.prisma.user.findFirst({
      where: { id: studentId, teacherId },
    });
    if (!student) {
      throw new ForbiddenException("Student not found or not assigned to you");
    }

    const tempPassword = generateSecurePassword(16);

    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await this.prisma.user.update({
      where: { id: studentId },
      data: { password: hashedPassword },
    });

    return { success: true, tempPassword };
  }
}
