import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface Delta {
    added: number[]
    removed: number[] 
}

@Injectable()
export class DeltaService {
    constructor(private prisma: PrismaService) { }

    async computeDelta(segmentId: number, newMemberIds: number[]): Promise<Delta> {
        const currentMembers = await this.prisma.segmentMembership.findMany({
            where: { segmentId },
            select: { userId: true }
        });
        const newMemberSet = new Set(newMemberIds);
        const currentMemberIds = new Set(currentMembers.map(m => m.userId));
        const added = newMemberIds.filter(id => !currentMemberIds.has(id));
        const removed = [...currentMemberIds].filter(id => !newMemberSet.has(id));
        return { added, removed };
    }

    async applyDelta(segmentId: number, delta: Delta, simDate: Date): Promise<void> {
        const createData = delta.added.map(userId => ({ segmentId, userId }));

        const deltaLog = {
            segmentId: segmentId,
            addedIds: delta.added,
            removedIds: delta.removed,  
            simulatedAt: simDate
        }

        await this.prisma.$transaction([
            this.prisma.segmentMembership.createMany({data: createData}),
            this.prisma.segmentMembership.deleteMany({where: {userId: {in: delta.removed}, segmentId: segmentId}}),
            this.prisma.deltaLog.create({data: deltaLog})
        ]);
    }
}