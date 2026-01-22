export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export interface CreateTaskBody {
  title: string;
  description?: string;
  status?: TaskStatus;
}

export interface UpdateTaskBody {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

export interface TaskQueryParams {
  page?: string;
  limit?: string;
  status?: TaskStatus;
  search?: string;
}
