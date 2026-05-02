import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  getAll() {
    return this.prisma.user.findMany({
      include: {
        _count: {
          select: { segmentMemberships: true },
        },
      },
    });
  }

  search(q: string) {
    return this.prisma.user.findMany({
      where: {  name: { contains: q, mode: 'insensitive' } },
      include: {
        _count: {
          select: { segmentMemberships: true },
        },
      },
    });
  }

  get(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { segmentMemberships: true },
        },
      },
    });
  }

  create(dto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        habits: dto.habbits
      },
    });
  }

  delete(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}