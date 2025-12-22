export interface Comment {
    id: string;
    user: string;
    text: string;
    timestamp: number;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    x: number;
    y: number;
    updatedBy?: string;
    comments: Comment[];

}

export interface User {
    name: string;
    id?: string; 
}