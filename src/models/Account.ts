export type RegisterData = {
    username: string;
    full_name: string;
    password: string;
    email: string;
}

export type RegisterError = {
    field: string;
    message: string;
}

export type RegisterResponse = {
    message: string;
    user: {
        id: string;
        full_name: string;
        username: string;
        email: string;
        need_to_connected_social: boolean;
        login_streak: number;
    };
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export type LoginData = {
    username?: string;
    password: string;
    email?: string;
    identifier?: 'username' | 'email';
}

export type LoginResponse = {
    message: string;
    user: {
        id: string;
        full_name: string;
        username: string;
        email: string;
        need_to_connected_social: boolean;
        login_streak: number;
    };
    access_token: string;
    refresh_token: string;
    token_type: string;
}