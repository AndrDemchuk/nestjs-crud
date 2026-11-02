import { Injectable, NotFoundException } from '@nestjs/common';
import { LoggerService } from './user.logger.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface SuccessResponse<T> {
    data: T,
    message: string
}


//implemeent:
// findOneUser(id: number)
// createUser(dto: CreateUserDto)
//updateUser (id: number, dto: UpdateUserDto)
//deleteUser(id: number) 

@Injectable()
export class UserService {
    constructor(private readonly logger: LoggerService) { }

    private users: User[] = [
        { id: 1, name: 'John Doe', email: 'TbYH1@example.com' },
        { id: 2, name: 'Jane Doe', email: 'jane@doe' },
    ]

    createUser(dto: CreateUserDto): SuccessResponse<CreateUserDto> {
        this.users = [...this.users, dto]
        return { data: dto, message: 'User created successfully' };
    }


    updateUser(id: number, dto: UpdateUserDto): SuccessResponse<User> {
        const user = this.findOneUser(id);
        if (user) {
            const updatedUser = { ...user, ...dto, id };
            this.users = this.users.map(user => user.id === id ? updatedUser : user);
            return {
                data: updatedUser,
                message: 'User updated successfully'
            }
        } else throw new NotFoundException(`user with id ${id} not found`);
    }


    findOneUser(id: number): User | undefined {
        const user = this.users.find(user => user.id === id);
        if (!user) throw new NotFoundException(`user with ${id} not found`)
        return user;
    }

    deleteUser(id: number) {
        const user = this.findOneUser(id);
        if (!user) throw new NotFoundException(`User with ${id} id not found`);
        this.users = this.users.filter(user => user.id !== id);
        return id;
    }


    findAllUsers(name: string = ''): User[] {
        this.logger.log('Finding all users');
        return this.users.filter(user => user.name.toLowerCase().includes(name.toLowerCase()),
        );
    }
}
