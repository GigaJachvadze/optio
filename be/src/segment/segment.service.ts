import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSegmentDto } from './segment.dto';

@Injectable()
export class SegmentService {
  constructor(private prisma: PrismaService) {}

  getAll() {
    return this.prisma.segment.findMany({
      include: {
        memberships: true,
        _count: {
          select: { memberships: true },
        },
      },
    });
  }

  getForDelta() {
    return this.prisma.segment.findMany({
      include: {
        deltaLogs: true,
        _count: {
          select: { memberships: true },
        },
      },
    });
  }

  search(q: string) {
    return this.prisma.segment.findMany({
      where: {  name: { contains: q, mode: 'insensitive' } },
      include: {
        _count: {
          select: { memberships: true },
        },
      },
    });
  }

  get(id: number) {
    return this.prisma.segment.findUnique({
      where: { id },
      include: {
        memberships: {
          include: { user: true },
        },
        _count: {
          select: { memberships: true },
        },
      },
    });
  }

  async create(dto: CreateSegmentDto) {
    if (dto.type === 'STATIC' && (!dto.memberIds || dto.memberIds.length === 0)) {
      throw new BadRequestException('Static segments must have at least one member');
    }

    return this.prisma.segment.create({
    data: {
      name: dto.name,
      type: dto.type,
      rules: dto.rules ?? null,
      memberships: dto.type === 'STATIC' && dto.memberIds?.length
        ? {
            create: dto.memberIds.map((userId) => ({
              userId: parseInt(userId),
              addedAt: new Date(),
            })),
          }
        : undefined,
    },
    include: { memberships: true },
  });

    // const segment = await this.prisma.segment.create({
    //   data: {
    //     name: dto.name,
    //     type: dto.type,
    //     rules: dto.rules ?? null,
    //   },
    // });

    // if (dto.type === 'STATIC' && dto.memberIds && dto.memberIds.length > 0) {
    //   await this.prisma.segmentMembership.createMany({
    //     data: dto.memberIds.map((userId) => ({
    //       userId: parseInt(userId),
    //       segmentId: segment.id,
    //       addedAt: new Date()
    //     })),
    //     skipDuplicates: true
    //   });
    // }

    // return segment
  }

  update(id: number, dto: CreateSegmentDto) {
    return this.prisma.segment.update({
      where: { id },
      data: {
        name: dto.name,
        rules: dto.rules,
      },
    });
  }

  delete(id: number) {
    return this.prisma.segment.delete({
      where: { id },
    });
  }

  getMembers(id: number) {
    return this.prisma.segmentMembership.findMany({
      where: { segmentId: id },
      include: {
        user: true,
      },
    });
  }
}