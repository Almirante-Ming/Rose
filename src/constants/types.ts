export interface Note {
    time: string;
    subject: string;
    location: string;
    note: string;
}

export interface NotesData {
    [date: string]: Note[];
}

export interface CalendarDay {
    dateString: string;
}