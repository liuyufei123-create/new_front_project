import { StudentStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class QueryStudentsDto extends PaginationQueryDto {
    classId?: number;
    status?: StudentStatus;
}
