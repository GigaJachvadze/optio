import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { UsersService } from '../services/users.service';
import { debounceTime, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-users',
  imports: [],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  private destroyRef = inject(DestroyRef);
  private usersService = inject(UsersService);
  private cdr = inject(ChangeDetectorRef);

  searchSubject: Subject<string> = new Subject();

  isSearching = signal<boolean>(false);

  users: any;

  currentPage = 1;
  pageSize = 10;
  search = '';

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((value) => {
      this.search = value;
      this.getUsers();
    });
    this.getUsers();
  }

  getUsers(): void {
    this.isSearching.set(true);
    this.usersService.getUsersPaginator(this.currentPage, this.pageSize, this.search).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (users) => {
        this.users = users;
        this.isSearching.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onUserSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchSubject.next(query);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.users.totalPages) return;
    this.currentPage = page;
    this.getUsers();
  }

  getPageNumbers(): (number | string)[] {
    const total = this.users.totalPages;
    const current = this.currentPage;
    
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }

    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  }
}
