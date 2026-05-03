import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import type { CreateUserDto } from './user.dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getAll() {
    return this.userService.getAll();
  }

  @Get('paginator')
  getAllPaginator(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('search') search = ''
  ) {
    return this.userService.getPaginator(+page, +pageSize, search);
  }

  @Get('search')
  searchUsers(@Query('q') q: string) {
    return this.userService.search(q);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.get(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delete(id);
  }
}