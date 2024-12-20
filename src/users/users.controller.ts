import { Controller, Get, Post, Query, Param, Body, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users?page=<page>&pageSize=<pageSize>&search=<search>
  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('search') search: string,
  ) {
    const pageNumber = parseInt(page, 10);
    const size = parseInt(pageSize, 10);

    return this.usersService.findAllPaginated(pageNumber, size, search);
  }

  // GET /users/:id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(parseInt(id, 10));
  }

  // POST /users/save
  @Post('save')
  async saveUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.saveUser(createUserDto);
  }

  // POST /users/update
  @Post('update')
  async updateUser(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(updateUserDto);
  }

  // DELETE /users/:id
  @Delete(':id')
  async deleteOne(@Param('id') id: string) {
    return this.usersService.deleteOne(parseInt(id, 10));
  }
}
