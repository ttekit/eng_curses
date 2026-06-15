import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { CreateClassDto } from "./dto/create-class.dto";
import { UpdateClassDto } from "./dto/update-class.dto";


@Injectable()
export class TeacherClassesService {
    constructor(private readonly prisma: PrismaService){}

    async createClass(teacherId: number, dto: CreateClassDto) {
        return this.prisma.class.create({
          data: {
            name: dto.name,
            teacherId: teacherId,
          },
        });
      }
    
      async getMyClasses(teacherId: number) {
        return this.prisma.class.findMany({
          where: { teacherId },
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: { students: true },
            },
          },
        });
      }
    
      async getClassById(teacherId: number, classId: number) {
        const targetClass = await this.prisma.class.findFirst({
          where: { id: classId, teacherId },
          include: {
            students: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        });
    
        if (!targetClass) {
          throw new ForbiddenException(
            "The class was not found, or you do not have access to it.",
          );
        }
    
        return targetClass;
      }
    
      async updateClass(teacherId: number, classId: number, dto: UpdateClassDto) {
        const targetClass = await this.prisma.class.findFirst({
          where: { id: classId, teacherId },
        });
    
        if (!targetClass) {
          throw new ForbiddenException(
            "The class was not found, or you do not have access to it.",
          );
        }
    
        return this.prisma.class.update({
          where: { id: classId },
          data: { name: dto.name },
        });
      }
    
      async removeClass(teacherId: number, classId: number) {
        const targetClass = await this.prisma.class.findFirst({
          where: { id: classId, teacherId },
        });
    
        if (!targetClass) {
          throw new ForbiddenException(
            "The class was not found, or you do not have access to it.",
          );
        }
    
        return this.prisma.class.delete({
          where: { id: classId },
        });
      }
}