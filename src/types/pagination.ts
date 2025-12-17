export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginationResult<T> {
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: T[];
}