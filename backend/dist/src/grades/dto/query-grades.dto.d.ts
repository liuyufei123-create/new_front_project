import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class QueryGradesDto extends PaginationQueryDto {
    studentId?: number;
    courseId?: number;
    semester?: string;
}
