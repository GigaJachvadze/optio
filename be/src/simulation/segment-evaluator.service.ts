import { Injectable } from '@nestjs/common';

export interface UserData {
  id: number;
  transactions: { amount: number; createdAt: Date }[];
}

@Injectable()
export class SegmentEvaluatorService {
    constructor() { }

    getUsersMatchingSegment(rules: any, users: UserData[], memberships: Map<number, Set<number>>, simDate: Date): number[] {
        if (!rules?.conditions?.length) return [];

        return users.filter(user => {
                const results = rules.conditions.map((condition: any) =>
                    this.userMatchesCondition(user, condition, memberships, simDate)
                );
                return rules.operator === 'AND'? results.every(Boolean) : results.some(Boolean);
            }).map(user => user.id);
    }

    private userMatchesCondition(user: UserData, condition: any, memberships: Map<number, Set<number>>, simDate: Date): boolean {
        if (condition.type === 'segment') {
            return memberships.get(condition.segmentId)?.has(user.id) ?? false;
        }

        if (condition.field === 'transactionCount') {
            const count = user.transactions.filter(t => t.createdAt >= new Date(simDate.getTime() - condition.periodDays * 24 * 60 * 60 * 1000)).length;
            return this.compare(count, condition.operator, condition.value);
        }

        if (condition.field === 'totalSpend') {
            const total = user.transactions.filter(t => t.createdAt >= new Date(simDate.getTime() - condition.periodDays * 24 * 60 * 60 * 1000)).reduce((sum, t) => sum + t.amount, 0);
            return this.compare(total, condition.operator, condition.value);
        }

        if (condition.field === 'daysSinceLastTransaction') {
            if (!user.transactions.length) return false;
            const lastTransaction = user.transactions.reduce((latest, t) => t.createdAt > latest ? t.createdAt : latest, new Date(0));
            const daysSinceLastTransaction = Math.floor((simDate.getTime() - lastTransaction.getTime()) / (1000 * 60 * 60 * 24));
            return this.compare(daysSinceLastTransaction, condition.operator, condition.value);
        }

        return false;
    }

    private compare(actual: number, operator: string, value: number): boolean {
        if (operator === 'greaterThan') return actual > value;
        if (operator === 'lessThan') return actual < value;
        if (operator === 'equals') return actual === value;
        return false;
    }
}