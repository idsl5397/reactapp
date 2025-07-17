// types/UserType.ts

export interface UserData {
    nickname: string;
    email: string;
    token: string;
}

export interface UserProfileDto {
    userId: string;
    nickname: string;
    email: string;
    organizationId: number;
    organizationName: string;
    organizationTypeId: number;
    role: 'admin' | 'company';
}