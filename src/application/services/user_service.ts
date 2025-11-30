import { type UserRepository } from "src/domain/repositories/user_repository";
import { User } from "src/domain/aggregates/user";
import { RoleAssignment } from "src/domain/value_objects/role_assignment";
import { Role, RoleName } from "src/domain/value_objects/role";
import { SystemRoles } from "src/domain/value_objects/system_roles";
import {
  ApplicationError,
  ApplicationErrorType,
} from "src/errors/application_error";
import {
  type RegisterUserCommand,
  type RegisterUserResult,
} from "../types/user";

export class UserService {
  public constructor(private readonly userRepository: UserRepository) {}

  public async registerUser(
    command: RegisterUserCommand,
  ): Promise<RegisterUserResult> {
    const id = await this.userRepository.nextIdentity();
    let emailAddress = command.emailAddress.toLowerCase();

    const isExistingUser =
      await this.userRepository.existsByEmail(emailAddress);
    if (isExistingUser) {
      throw new ApplicationError({
        type: ApplicationErrorType.EMAIL_DUPLICATE_ERROR,
        message: `User with email ${command.emailAddress} already exists`,
      });
    }

    const now = new Date();
    const roleName = RoleName.CUSTOMER;
    const rolePermissions = SystemRoles.rolePermissions(roleName);
    const role = new Role(roleName, rolePermissions);
    const roleAssignment = new RoleAssignment(role, now, "system");
    const user = await User.register({
      id,
      emailAddress,
      displayName: command.displayName,
      plainPassword: command.plainPassword,
      roleAssignment,
      createdAt: now,
    });

    await this.userRepository.save(user);

    return {
      userID: user.id.value,
    };
  }
}
