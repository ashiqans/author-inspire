import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { AuthorService } from '../Services/author.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-authors',
  templateUrl: './authors.component.html',
  styleUrls: ['./authors.component.scss'],
})
export class AuthorsComponent implements OnInit {
  @ViewChild('title') addBookSection!: ElementRef;
  @ViewChildren('editedBook') editedBookList!: QueryList<ElementRef>;
  authorDetails: any;
  booksList: any;
  bookListSubscription!: Subscription;
  sortByName: boolean = false;
  addBookForm!: FormGroup;
  addNewBook: boolean = false;
  minDate = new Date(1900, 1, 1);
  maxDate = new Date();

  constructor(
    private authorService: AuthorService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.authorService.getBooks().subscribe((response) => {
      this.authorDetails = response?.data;
      this.booksList = [...this.authorDetails?.books];
      this.authorService.setAuthorBook(this.authorDetails?.books);
      this.sortBook(); // by default sort by Publish Date
    });
  }

  // formcontrol getter 
  get newBook() {
    return this.addBookForm.controls;
  }

  // Add Book list
  addBook() {
    this.addNewBook = true;
    // initialization of reactive form
    this.addBookForm = this.formBuilder.group({
      title: ['', Validators.required],
      PublishDate: ['', Validators.required],
      purchaseLink: ['', Validators.required],
      imageUrl: ['', Validators.required],
      editBook: [false],
      editBookIndex: [''],
    });
  }

  // Save and Edit Book
  saveBook() {
    let isBookEdited = this.addBookForm.get('editBook')?.value;
    let editedBookIndex = this.addBookForm.get('editBookIndex')?.value;
    let bookDetails = {
      title: this.addBookForm.get('title')?.value,
      PublishDate: new Date(
        this.addBookForm.get('PublishDate')?.value
      ).getFullYear(),
      purchaseLink: this.addBookForm.get('purchaseLink')?.value,
      imageUrl: this.addBookForm.get('imageUrl')?.value,
    };
    this.addNewBook = false;
    this.addBookForm.reset();

    // condition to check for add/edit book
    if (isBookEdited) {
      this.booksList.splice(editedBookIndex, 1, bookDetails);
      this.editedBookFocus(editedBookIndex);
    } else {
      this.booksList.unshift(bookDetails);
    }
  }

  // Sort Book list based on Title and PublishDate
  sortBook() {
    if (this.sortByName) {
      // Sort by name
      this.booksList = this.booksList?.sort((a: any, b: any) => {
        const nameA = a?.title.toUpperCase();
        const nameB = b?.title.toUpperCase();
        return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
      });
    } else {
      // Sort by date
      this.booksList = this.booksList?.sort((a: any, b: any) => {
        const nameA = a?.PublishDate;
        const nameB = b?.PublishDate;
        return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
      });
    }
    this.sortByName = !this.sortByName;
  }

  // Edit Book list
  editBook(index: number, book: any) {
    this.addNewBook = true;
    this.addBookForm = this.formBuilder.group({
      title: [book.title, Validators.required],
      PublishDate: [new Date(book.PublishDate), Validators.required],
      purchaseLink: [book.purchaseLink, Validators.required],
      imageUrl: [book.imageUrl, Validators.required],
      editBook: true,
      editBookIndex: index,
    });
    this.addBookSection.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  // After editing a book, scroll to view method
  editedBookFocus(bookIndex: number) {
    let editedBookElementRef = this.editedBookList.find(
      (item, index) => index === bookIndex - 2
    );
    editedBookElementRef?.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  // action center - cancel method
  cancel() {
    this.addNewBook = false;
    this.addBookForm.reset();
  }

  // action center - Delete Book list based on index
  deleteBook(index: number) {
    this.booksList.splice(index, 1);
  }

  // action center - Reset Book list
  resetBook() {
    this.bookListSubscription = this.authorService
      .getAuthorBook()
      .subscribe((res) => {
        this.booksList = [...res];
        this.sortByName = false;
        this.sortBook();
        this.cancel();
      });
  }

  // Invalid Image URL placeholder
  invalidImgError(event: any, index: number) {
    event.target.src = 'assets/image/imgPlaceholder.jpg';
  }

  // trackItem public method for DOM re-utilization after reset
  public trackItem(index: number, item: any) {
    return item.trackId;
  }

  ngOnDestroy(): void {
    this.bookListSubscription.unsubscribe();
  }
}
