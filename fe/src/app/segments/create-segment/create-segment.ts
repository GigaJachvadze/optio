import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Condition, ConditionField, ConditionOperator, CreateSegmentRequest, FieldCondition, RuleOperator, SegmentCondition } from '../segments.dto';
import { SEGMENT_RULES_FIELD_OPTIONS, SEGMENT_RULES_OPERATOR_OPTIONS, SEGMENT_RULES_PERIOD_OPTIONS } from '../../const/const';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SegmentService } from '../../services/segment.service';
import { UsersService } from '../../services/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-segment',
  imports: [FormsModule],
  templateUrl: './create-segment.html',
  styleUrl: './create-segment.css',
})
export class CreateSegment implements OnInit {
  private destroyRef = inject(DestroyRef);
  private segmentService = inject(SegmentService);
  private usersService = inject(UsersService);
  private router = inject(Router);

  segment: CreateSegmentRequest = {
    name: '',
    type: 'STATIC',
    rules: null
  }

  segmentMembers = signal<any[]>([]);

  operator: RuleOperator = 'AND';

  users = signal<any[]>([]);

  userSearchString = '';

  private usersSearchSubject = new Subject<string>();

  isSearchingUsers = signal<boolean>(false);

  SEGMENT_RULES_FIELD_OPTIONS = SEGMENT_RULES_FIELD_OPTIONS;
  SEGMENT_RULES_OPERATOR_OPTIONS = SEGMENT_RULES_OPERATOR_OPTIONS;
  SEGMENT_RULES_PERIOD_OPTIONS = SEGMENT_RULES_PERIOD_OPTIONS;

  searchQuery = signal<string>('');
  private searchSubject = new Subject<string>();

  searchedSegments = signal<any[]>([]);

  ngOnInit(): void {
    this.listenToSegmentSearch();
    this.listenToUsersSearch();
  }

  listenToSegmentSearch() {
    this.searchSubject.asObservable().pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((query) => {
      this.getSegments(query);
    });
  }

  listenToUsersSearch() {
    this.usersSearchSubject.asObservable().pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((query) => {
      this.searchUsers(query);
    });
  }

  getSegments(query: string) {
    this.segmentService.searchSegments(query).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.searchedSegments.set(data);
      }
    });
  }

  staticSelected() {
    this.segment.type = 'STATIC';
    this.segment.rules = null;
  }

  dynamicSelected() {
    this.segment.type = 'DYNAMIC';
    this.segment.rules = {
      operator: 'AND',
      conditions: []
    }
  }

  toggleOperator() {
    if (!this.segment.rules) return;
    this.operator = this.operator === 'AND' ? 'OR' : 'AND';
    this.segment.rules.operator = this.operator;
    this.segment.rules.conditions = [];
  }

  addRule() {
    if (!this.segment.rules) return;
    this.segment.rules.conditions.push({
      type: 'field',
      field: SEGMENT_RULES_FIELD_OPTIONS[0].value as ConditionField,
      operator: SEGMENT_RULES_OPERATOR_OPTIONS[0].value as ConditionOperator,
      periodDays: SEGMENT_RULES_PERIOD_OPTIONS[0].value as number,
      value: 0
    } as FieldCondition);
  }

  removeRule(index: number) {
    if (!this.segment.rules) return;
    this.segment.rules.conditions.splice(index, 1);
  }

  conditionFieldChanged(event: any, index: number) {
    if (!this.segment.rules) return;
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'segment') {
      this.segment.rules.conditions[index] = {
        type: 'segment',
        segmentId: null
      } as SegmentCondition;
    } else {
      this.segment.rules.conditions[index] = {
        type: 'field',
        field: SEGMENT_RULES_FIELD_OPTIONS[0].value as ConditionField,
        operator: SEGMENT_RULES_OPERATOR_OPTIONS[0].value as ConditionOperator,
        periodDays: SEGMENT_RULES_PERIOD_OPTIONS[0].value as number,
        value: 0
      } as FieldCondition;
    }
  }

  selectSegment(segment: any, index: number) {
    if (!this.segment.rules) return;
    this.searchQuery.set('');
    (this.segment.rules.conditions[index] as SegmentCondition).segmentId = segment.id;
    (this.segment.rules.conditions[index] as SegmentCondition).segmentName = segment.name;
    console.log('Selected segment for condition:', this.segment);
  }


  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  onUserSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.usersSearchSubject.next(query);
    this.isSearchingUsers.set(true);
  }

  asField(condition: Condition): FieldCondition {
    return condition as FieldCondition;
  }

  searchUsers(query: string) {
    this.usersService.searchUsers(query).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.users.set(data);
        this.isSearchingUsers.set(false);
      }
    });
  }

  selectUserForStatic(user: any) {
    if (this.segment.type !== 'STATIC') return;
    if (!this.segment.memberIds) this.segment.memberIds = [];
    if (this.segment.memberIds.includes(user.id)) {
      alert('User already added to segment');
      return;
    };
    this.segment.memberIds.push(user.id);
    this.segmentMembers.set([...this.segmentMembers(), user]);
    this.userSearchString = '';
    this.users.set([]);
  }

  removeUserFromStatic(user: any, index: number) {
    if (this.segment.type !== 'STATIC') return;
    if (!this.segment.memberIds) return;
    this.segment.memberIds = this.segment.memberIds.filter(id => id !== user.id);
    this.segmentMembers.set(this.segmentMembers().filter(u => u.id !== user.id));
  }

  removeSelectedSegment(index: number) {
    (this.segment!.rules!.conditions[index] as SegmentCondition).segmentId = null;
    (this.segment!.rules!.conditions[index] as SegmentCondition).segmentName = undefined;
  }

  saveSegment() {
    if (!this.segment.name) {
      alert('Segment name is required');
      return;
    }
    if (this.segment.type === 'DYNAMIC' && (!this.segment.rules || this.segment.rules.conditions.length === 0)) {
      alert('Dynamic segments must have at least one rule');
      return;
    }
    if (this.segment.type === 'STATIC' && (!this.segment.memberIds || this.segment.memberIds.length === 0)) {
      alert('Static segments must have at least one member');
      return;
    }
    this.segmentService.createSegment(this.segment).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        console.log('Segment created successfully', data);
        this.router.navigate(['/segments']);
      },
      error: (error) => {
        console.error('Error creating segment', error);
      }
    });
  }
}
