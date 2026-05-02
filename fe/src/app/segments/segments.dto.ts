export type RuleOperator = 'AND' | 'OR';
export type ConditionOperator = 'greaterThan' | 'lessThan' | 'equals';
export type ConditionField = 'transactionCount' | 'totalSpend' | 'daysSinceLastTransaction';

export interface FieldCondition {
  type: 'field';
  field: ConditionField;
  operator: ConditionOperator;
  value: number;
  periodDays: number;
}

export interface SegmentCondition {
  type: 'segment';
  segmentId: number | null;
  segmentName?: string;
}

export type Condition = FieldCondition | SegmentCondition;

export interface RuleSet {
  operator: RuleOperator;
  conditions: Condition[];
}

export interface CreateSegmentRequest {
  name: string;
  type: 'DYNAMIC' | 'STATIC';
  rules?: RuleSet | null;
  memberIds?: number[];
}