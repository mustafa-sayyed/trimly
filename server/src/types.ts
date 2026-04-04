interface TokenPayload {
    id: number;
    email: string;
    name: string;
}

interface ApiError extends Error {
    statusCode?: number;
    success?: boolean;
}

interface User {
    id: number;
    email: string;
    name: string;
}


export type { TokenPayload, ApiError, User };
