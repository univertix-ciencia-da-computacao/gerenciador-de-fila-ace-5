export interface ApiResponse<TData = unknown> {
  success: boolean;
  message: string;
  data: TData;
}
