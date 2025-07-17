export interface Note {
    dt_init: string;      // Date in string format
    tm_init: string;      // Time in string format
    trainer_name: string; // Trainer/instructor name
    customer_name: string; // Customer name
    machine_name: string; // Machine/equipment name
    message: string;      // Additional message/notes
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