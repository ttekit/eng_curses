import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma.module';
import { TeacherStudentsController } from './teacher-students.controller';
import { TeacherStudentsService } from './teacher-students.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TeacherStudentsController],
  providers: [TeacherStudentsService],
})
export class TeacherStudentsModule {}
