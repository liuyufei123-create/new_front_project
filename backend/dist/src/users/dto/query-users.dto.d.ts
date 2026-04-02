import { Role, UserStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class QueryUsersDto extends PaginationQueryDto {
    role?: Role;
    status?: UserStatus;
}
