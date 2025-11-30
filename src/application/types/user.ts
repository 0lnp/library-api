import { AuthenticateCommand } from "./authenticate";

export interface RegisterUserCommand extends AuthenticateCommand {
  displayName: string;
}

export interface RegisterUserResult {
  userID: string;
}
