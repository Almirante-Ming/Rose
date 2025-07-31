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

export interface PersonData {
    cpf: string;
    name: string;
    email: string;
    phone: string;
    dt_birth: string;
    state: 'active' | 'inactive';
    p_type: 'customer' | 'trainer' | 'admin';
    password: string;
}

export interface PersonResponse {
    id: number;
    cpf: string;
    name: string;
    email: string;
    phone: string;
    dt_birth: string;
    state: string;
    p_type: string;
    dt_create: string;
    dt_update: string;
}

export interface ScheduleData {
    dt_init: string;
    tm_init: string;
    trainer_id: number;
    customer_id: number;
    machine_id: number;
    message: string;
    c_status: 'marked';
}

export interface ScheduleResponse extends ScheduleData {
    id: number;
    dt_create: string;
    dt_update: string;
}

export interface MachineResponse {
    id: number;
    name: string;
    description?: string;
    state: string;
}