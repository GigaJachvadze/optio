export interface CreateSegmentDto {
  name: string;
  type: 'DYNAMIC' | 'STATIC';
  rules?: any;
  memberIds?: string[];
}