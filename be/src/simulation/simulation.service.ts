import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HabbitDTO } from './habbit.dto';
import { SegmentEvaluatorService } from './segment-evaluator.service';
import { DeltaService } from './delta.service';
import { EventBusService } from './event-bus.service';

export interface SimulationState {
    currentDate: Date;
    running: boolean;
    daysPerTick: number;
}

@Injectable()
export class SimulationService {
    constructor(
        private prisma: PrismaService,
        private segmentEvaluator: SegmentEvaluatorService,
        private deltaService: DeltaService,
        private eventBus: EventBusService
    ) { }

    private loading = false;

    private state: SimulationState = {
        currentDate: this.buildInitialDate(),
        running: false,
        daysPerTick: 1,
    };

    private tickHandle: NodeJS.Timeout | null = null;

    private buildInitialDate(): Date {
        const d = new Date();
        d.setDate(d.getDate() - 120);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    getState(): SimulationState {
        return this.state;
    }

    start(): SimulationState {
        if (!this.tickHandle) this.tickHandle = setInterval(() => this.tick(), 1000);
        this.state.running = true;
        return this.state;
    }

    stop(): SimulationState {
        if (this.tickHandle) {
            clearInterval(this.tickHandle);
            this.tickHandle = null;
        }
        this.state.running = false;
        return this.state;
    }

    setSpeed(daysPerTick: number): SimulationState {
        this.state.daysPerTick = Math.max(1, Math.min(90, daysPerTick));
        return this.state;
    }

    async step(): Promise<SimulationState> {
        await this.tick();
        return this.state;
    }

    async tick(): Promise<void> {
        if (this.loading) return;
        this.loading = true;

        try {
            const from = new Date(this.state.currentDate);
            this.state.currentDate = new Date(this.state.currentDate.getTime() + this.state.daysPerTick * 1000 * 60 * 60 * 24);
            await this.registerNewUsers();
            await this.generateTransactions(from, this.state.currentDate);

            await this.evaluateSegments(this.state.currentDate);
            this.eventBus.emit({
                type: 'tick',
                data: { simDate: this.state.currentDate.toISOString(), daysAdvanced: this.state.daysPerTick }
            });
        } finally {
            this.loading = false;
        }
        
    }

    async evaluateSegments(simDate: Date): Promise<void> {
        const dynamicSegments = await this.prisma.segment.findMany({
            where: {type: 'DYNAMIC'}
        });

        const sortedSegments = this.sortSegments(dynamicSegments);

        const users = await this.segmentEvaluator.loadUsers(simDate);

        const memberships = await this.prisma.segmentMembership.findMany({
            where: {
                segment: {type: {equals: 'DYNAMIC'}}
            }
        });

        const membershipsMap = new Map<number, Set<number>>();
        memberships.forEach(item => {
            if (!membershipsMap.has(item.segmentId)) {
                membershipsMap.set(item.segmentId, new Set<number>());
            }
            membershipsMap.get(item.segmentId)!.add(item.userId);
        });

        for (let i = 0; i < sortedSegments.length; i++) {
            const segment = sortedSegments[i];
            const usersMatch = this.segmentEvaluator.getUsersMatchingSegment(segment.rules, users, membershipsMap, simDate);
            console.log(`Segment ${segment.name}: ${usersMatch.length} matches`);
            membershipsMap.set(segment.id, new Set(usersMatch));

            const delta = await this.deltaService.computeDelta(segment.id, usersMatch);
            if (!delta.added.length && !delta.removed.length) continue;

            await this.deltaService.applyDelta(segment.id, delta, simDate);
            this.eventBus.emit({
                type: 'segment_delta',
                data: {
                    segmentId: segment.id,
                    segmentName: segment.name,
                    simDate: simDate.toISOString(),
                    added: delta.added,
                    removed: delta.removed
                }
            });
        }
    }

    private async generateTransactions(from: Date, to: Date): Promise<void> {
        const users = await this.prisma.user.findMany({
            select: { id: true, habits: true }
        });

        const toCreate: { userId: number; amount: number; createdAt: Date }[] = [];
        const habitsToUpdate: { id: number; habits: HabbitDTO }[] = [];
        const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

        for (const user of users) {
            const habits = user.habits as any as HabbitDTO;


            for (let d = 0; d < days; d++) {
                const date = new Date(from.getTime() + d * 1000 * 60 * 60 * 24);
                if (Math.random() < 0.1 * habits.spendFrequencyMultiplier) {
                    toCreate.push({
                        userId: user.id,
                        amount: Math.floor((Math.random() * 1450 + 50) * habits.spendAmountMultiplier),
                        createdAt: date,
                    });
                    habitsToUpdate.push({ id: user.id, habits: this.nudgeHabits(habits) });
                }
            }
        }

        if (toCreate.length > 0) {
            await this.prisma.transaction.createMany({ data: toCreate });
        }

        if (habitsToUpdate.length > 0) {
            for (const u of habitsToUpdate) {
                await this.prisma.user.update({
                    where: { id: u.id },
                    data: { habits: u.habits as any }
                });
            }
        }
    }

    private nudgeHabits(habits: HabbitDTO): HabbitDTO {
        const nudge = () => parseFloat(((Math.random() - 0.5) * 0.1).toFixed(2)); // -0.05 to +0.05
        
        return {
            spendFrequencyMultiplier: parseFloat(
                Math.max(0.1, Math.min(2.0, habits.spendFrequencyMultiplier + nudge())).toFixed(2)
            ),
            spendAmountMultiplier: parseFloat(
                Math.max(0.1, Math.min(2.0, habits.spendAmountMultiplier + nudge())).toFixed(2)
            ),
        };
    }

    private async registerNewUsers(): Promise<void> {
        if (Math.random() > 0.3) return;

        const count = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < count; i++) {
            await this.prisma.user.create({
                data: {
                    name: faker.person.fullName(),
                    email: faker.internet.email(),
                    habits: {
                        spendFrequencyMultiplier: parseFloat((Math.random() + 1).toFixed(2)),
                        spendAmountMultiplier: parseFloat((Math.random() + 1).toFixed(2)),
                    }
                }
            });
        }
    }

    private sortSegments(segments: any[]): any[] {
        const withoutSegmentDeps = segments.filter(s => 
            !s.rules?.conditions?.some((c: any) => c.type === 'segment')
        );
        const withSegmentDeps = segments.filter(s => 
            s.rules?.conditions?.some((c: any) => c.type === 'segment')
        );
        return [...withoutSegmentDeps, ...withSegmentDeps];
    }
}