export interface ApiResponse<K> {
    code: number;
    error: boolean;
    errors: string[];
    result: Array<K>;
    success : boolean;
    totalRecords : number;
}

