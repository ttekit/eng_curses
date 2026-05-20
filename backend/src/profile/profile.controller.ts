import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Get('learning-stats')
    async getLearningStats(@Request() req) {
        const userId = Number(req.user.id || req.user.sub);
        return this.profileService.getLearningStats(userId);
    }

    @Get('activity-log')
    async getActivityLog(@Request() req) {
        const userId = Number(req.user.id || req.user.sub);
        return this.profileService.getActivityLog(userId);
    }
    @Get('progress-details')
    async getProgressDetails(@Request() req) {
        const userId = Number(req.user.id || req.user.sub);
        return this.profileService.getProgressDetails(userId);
    }

    @Get('vocabulary-stats')
    async getVocabularyStats(@Request() req: any) {
        return this.profileService.getVocabularyStats(req.user.sub);
    }
}