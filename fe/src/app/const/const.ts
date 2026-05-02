export const API = 'http://localhost:3000/';

export const SEGMENT_RULES_FIELD_OPTIONS = [
  { label: 'Transaction Count', value: 'transactionCount' },
  { label: 'Total Spend',       value: 'totalSpend' },
  { label: 'Days Since Last Transaction', value: 'daysSinceLastTransaction' },
  { label: 'Segment Filter',    value: 'segment' },
];

export const SEGMENT_RULES_OPERATOR_OPTIONS = [
  { label: 'Greater than', value: 'greaterThan' },
  { label: 'Less than',    value: 'lessThan' },
  { label: 'Equals',       value: 'equals' },
];

export const SEGMENT_RULES_PERIOD_OPTIONS = [
  { label: 'Last 7 Days',   value: 7 },
  { label: 'Last 30 Days',  value: 30 },
  { label: 'Last 60 Days',  value: 60 },
  { label: 'Last 90 Days',  value: 90 },
  { label: 'Last 365 Days', value: 365 },
];