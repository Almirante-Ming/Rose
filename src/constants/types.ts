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

export interface JwtPayload {
    sub: string; // email
    user_id: number;
    acc_level: number; // 0 = user, 1 = trainer, 2 = admin
    exp: number; // expiration timestamp
}

export interface UserRole {
    level: number;
    name: 'user' | 'trainer' | 'admin';
    permissions: string[];
}

export interface AuthUser {
    id: number;
    email: string;
    role: UserRole;
}