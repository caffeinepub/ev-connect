import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface CarProfile {
    status: CarStatus;
    model: string;
    nickname: string;
    batteryLevel: bigint;
    owner: Principal;
    lastUpdated: Time;
}
export interface RegisterCarInput {
    model: string;
    nickname: string;
    batteryLevel: bigint;
}
export interface Message {
    to?: Principal;
    content: string;
    from: Principal;
    read: boolean;
    timestamp: Time;
}
export interface BatteryAlert {
    car: CarProfile;
    timestamp: Time;
}
export interface UserProfile {
    name: string;
}
export enum CarStatus {
    idle = "idle",
    driving = "driving",
    parked = "parked"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteCarProfile(): Promise<void>;
    getAlertFeed(): Promise<Array<BatteryAlert>>;
    getAllActiveCars(): Promise<Array<CarProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMessages(): Promise<Array<Message>>;
    getOwnCarProfile(): Promise<CarProfile>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markMessagesAsRead(): Promise<void>;
    registerCar(input: RegisterCarInput): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(to: Principal | null, content: string): Promise<void>;
    updateBatteryLevel(batteryLevel: bigint): Promise<void>;
    updateStatus(status: CarStatus): Promise<void>;
}
