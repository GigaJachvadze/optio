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

  async getPaginator(page: number, pageSize: number, search: string) {
    const WHERE = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' as 'insensitive' } }
      ]
    } : {}

    const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where: WHERE,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.user.count({ where: WHERE })
    ]);

    return {
        data: users,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
    };
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