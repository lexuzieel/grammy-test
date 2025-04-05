export type User = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
};

export type Message = {
  text?: string;
  command?: string;
  user: User;
};

export type Request = {
  updateId: number;
  method: string;
  payload: any;
};
