export interface Note {
    date: any;
    dt_init: string;
    tm_init: string;
    trainer_name: string;
    customer_name: string;
    machine_name: string;
    message: string;
}

export interface NotesData {
    [date: string]: Note[];
}

export interface CalendarDay {
    dateString: string;
}

export interface JwtPayload {
    sub: string;
    user_id: number;
    acc_level: number;
    exp: number; 
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