export interface ApiResponse<K> {
    code: number;
    error: boolean;
    errors: string[];
    result: K;
    success : boolean;
    totalRecords : number;
}

