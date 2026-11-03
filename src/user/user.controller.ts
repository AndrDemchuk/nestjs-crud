import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { type SuccessResponse, User, UserService } from './user.service.js';
import { RoleGuard } from '../guards/role.guard.js';

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) { }

    @Get()
    getUsers(@Query('name') name: string) {
        return this.userService.findAllUsers(name);
    }

    @Get('name')
    getUser(@Query('name') name: string) {
        const users = [
            { id: 1, name: 'John Pork' },
            { id: 2, name: 'Annet' }
        ];

        if (name) {
            return users.filter(user => user.name.toLowerCase().includes(name.toLowerCase()));
        }

        return users;
    }

    @Get(':id')
    getUserById(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findOneUser(id);
    }

    @Post()
    createUser(@Body() createUserDto: CreateUserDto): SuccessResponse<CreateUserDto> {
        return this.userService.createUser(createUserDto);
    }

    @Put(':id')
    updateUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): SuccessResponse<User> {
        return this.userService.updateUser(id, updateUserDto)
    }

    @Delete(':id')
    @UseGuards(RoleGuard)
    deleteUser(@Param('id', ParseIntPipe) id: number) {
        return this.userService.deleteUser(id);
    }


}
