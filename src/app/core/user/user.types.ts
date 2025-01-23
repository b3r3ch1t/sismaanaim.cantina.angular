export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status?: string;
    profiles?: Array<{ id: number; name: string }>;
}

