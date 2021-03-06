export interface IEntity<T> {
  id: T;
}

export interface IServerReturn<T> {
  result: T;
  success: boolean;
  errorMessage: string;
  type: number;
}

export interface IServerPageReturn<T> extends IServerReturn<T> {
  total: number;
}