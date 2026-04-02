import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(): Promise<{
        studentCount: number;
        classCount: number;
        courseCount: number;
        gradeCount: number;
    }>;
    getClassDistribution(): Promise<{
        classId: number;
        className: string;
        studentCount: number;
    }[]>;
    getCourseAverage(): Promise<{
        courseId: number;
        courseName: string;
        courseCode: string;
        averageScore: number;
    }[]>;
    getPassRate(): Promise<{
        courseId: number;
        courseName: string;
        courseCode: string;
        passRate: number;
    }[]>;
}
