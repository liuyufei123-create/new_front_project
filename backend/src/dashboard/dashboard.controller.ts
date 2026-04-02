import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('class-distribution')
  getClassDistribution() {
    return this.dashboardService.getClassDistribution();
  }

  @Get('course-average')
  getCourseAverage() {
    return this.dashboardService.getCourseAverage();
  }

  @Get('pass-rate')
  getPassRate() {
    return this.dashboardService.getPassRate();
  }
}
