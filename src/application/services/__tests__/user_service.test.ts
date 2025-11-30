import { UserService } from "../user_service";
import { type UserRepository } from "src/domain/repositories/user_repository";
import { User } from "src/domain/aggregates/user";
import { UserID } from "src/domain/value_objects/user_id";
import {
  ApplicationError,
  ApplicationErrorType,
} from "src/errors/application_error";
import { InvariantError, InvariantErrorType } from "src/errors/invariant_error";
import { RoleName } from "src/domain/value_objects/role";
import { type RegisterUserCommand } from "src/application/types/user";
import { jest } from "@jest/globals";

describe("UserService", () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockUserId = new UserID("user_12345");
  const mockEmail = "test@example.com";
  const mockDisplayName = "Test User";
  const mockValidPassword = "SecurePass123!";

  beforeEach(() => {
    mockUserRepository = {
      existsByEmail: jest.fn(),
      save: jest.fn(),
      nextIdentity: jest.fn(),
    } as Partial<UserRepository> as jest.Mocked<UserRepository>;

    userService = new UserService(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    const createRegisterCommand = (
      emailAddress: string = mockEmail,
      displayName: string = mockDisplayName,
      plainPassword: string = mockValidPassword,
    ): RegisterUserCommand => ({
      emailAddress,
      displayName,
      plainPassword,
    });

    describe("successful registration", () => {
      it("should successfully register a new user with valid data", async () => {
        const command = createRegisterCommand();
        mockUserRepository.nextIdentity.mockResolvedValue(mockUserId);
        mockUserRepository.existsByEmail.mockResolvedValue(false);
        mockUserRepository.save.mockResolvedValue(undefined);

        const result = await userService.registerUser(command);

        expect(result).toBeDefined();
        expect(result.userID).toBe(mockUserId.value);
      });

      it("should call repository methods in correct order", async () => {
        const command = createRegisterCommand();
        mockUserRepository.nextIdentity.mockResolvedValue(mockUserId);
        mockUserRepository.existsByEmail.mockResolvedValue(false);
        mockUserRepository.save.mockResolvedValue(undefined);

        await userService.registerUser(command);

        expect(mockUserRepository.nextIdentity).toHaveBeenCalledTimes(1);
        expect(mockUserRepository.existsByEmail).toHaveBeenCalledTimes(1);
        expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(
          command.emailAddress,
        );
        expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
      });

      it("should create user with CUSTOMER role by default", async () => {
        const command = createRegisterCommand();
        mockUserRepository.nextIdentity.mockResolvedValue(mockUserId);
        mockUserRepository.existsByEmail.mockResolvedValue(false);

        let savedUser: User | undefined;
        mockUserRepository.save.mockImplementation(async (user: User) => {
          savedUser = user;
        });

        await userService.registerUser(command);

        expect(savedUser).toBeDefined();
        expect(savedUser!.roleAssignment.role.name).toBe(RoleName.CUSTOMER);
      });

      it("should save user with correct properties", async () => {
        const command = createRegisterCommand();
        mockUserRepository.nextIdentity.mockResolvedValue(mockUserId);
        mockUserRepository.existsByEmail.mockResolvedValue(false);

        let savedUser: User | undefined;
        mockUserRepository.save.mockImplementation(async (user: User) => {
          savedUser = user;
        });

        await userService.registerUser(command);

        expect(savedUser).toBeDefined();
        expect(savedUser!.id).toBe(mockUserId);
        expect(savedUser!.emailAddress).toBe(command.emailAddress);
        expect(savedUser!.displayName).toBe(command.displayName);
        expect(savedUser!.hashedPassword).toBeDefined();
        expect(savedUser!.hashedPassword).not.toBe(command.plainPassword);
      });

      it("should assign role with system as assignedBy", async () => {
        const command = createRegisterCommand();
        mockUserRepository.nextIdentity.mockResolvedValue(mockUserId);
        mockUserRepository.existsByEmail.mockResolvedValue(false);

        let savedUser: User | undefined;
        mockUserRepository.save.mockImplementation(async (user: User) => {
          savedUser = user;
        });

        await userService.registerUser(command);

        expect(savedUser).toBeDefined();
        expect(savedUser!.roleAssignment.assignedBy).toBe("system");
      });

      it("should initialize user with zero login attempts", async () => {
        const command = createRegisterCommand();
        mockUserRepository.nextIdentity.mockResolvedValue(mockUserId);
        mockUserRepository.existsByEmail.mockResolvedValue(false);

        let savedUser: User | undefined;
        mockUserRepository.save.mockImplementation(async (user: User) => {
          savedUser = user;
        });

        await userService.registerUser(command);

        expect(savedUser).toBeDefined();
        expect(savedUser!.loginAttempts).toBe(0);
        expect(savedUser!.lastLoginAt).toBeNull();
      });

      it("should return userID matching the saved user", async () => {
        const command = createRegisterCommand();
        const customUserId = new UserID("user_custom_99999");
        mockUserRepository.nextIdentity.mockResolvedValue(customUserId);
        mockUserRepository.existsByEmail.mockResolvedValue(false);
        mockUserRepository.save.mockResolvedValue(undefined);

        const result = await userService.registerUser(command);

        expect(result.userID).toBe(customUserId.value);
      });

      it("should handle different valid display names", async () => {
        const displayNames = [
          "John Doe",
          "Alice",
          "Bob Smith Jr.",
          "María García",
        ];

        for (const displayName of displayNames) {
          jest.clearAllMocks();
          const command = createRegisterCommand(mockEmail, displayName);
          mockUserRepository.nextIdentity.mockResolvedValue(
            new UserID(`user_${displayName}`),
          );
          mockUserRepository.existsByEmail.mockResolvedValue(false);

          let savedUser: User | undefined;
          mockUserRepository.save.mockImplementation(async (user: User) => {
            savedUser = user;
          });

          await userService.registerUser(command);

          expect(savedUser).toBeDefined();
          expect(savedUser!.displayName).toBe(displayName);
        }
      });
    });

    describe("duplicate email validation", () => {
      it("should throw error when email already exists", async () => {
        const command = createRegisterCommand();

        mockUserRepository.nextIdentity.mockResolvedValue(mockUserId);
        mockUserRepository.existsByEmail.mockResolvedValue(true);

        await expect(userService.registerUser(command)).rejects.toThrow(
          new ApplicationError({
            type: ApplicationErrorType.EMAIL_DUPLICATE_ERROR,
            message: `User with email ${command.emailAddress} already exists`,
          }),
        );
      });

      it("should not call save when email is duplicate", async () => {
        const command = createRegisterCommand();

        mockUserRepository.nextIdentity.mockResolvedValue(mockUserId);
        mockUserRepository.existsByEmail.mockResolvedValue(true);

        await expect(userService.registerUser(command)).rejects.toThrow();
        expect(mockUserRepository.save).not.toHaveBeenCalled();
      });

      it("should be case-insensitive for email comparison", async () => {
        const command = createRegisterCommand("Test@Example.COM");
        mockUserRepository.nextIdentity.mockResolvedValue(mockUserId);
        mockUserRepository.existsByEmail.mockResolvedValue(false);
        mockUserRepository.save.mockResolvedValue(undefined);

        await userService.registerUser(command);

        expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(
          "test@example.com",
        );
      });
    });

    describe("password validation", () => {
      it("should reject password without lowercase letter", async () => {
        const command = createRegisterCommand(
          mockEmail,
          mockDisplayName,
          "PASSWORD123!",
        );
        mockUserRepository.nextIdentity.mockResolvedValue(mockUserId);
        mockUserRepository.existsByEmail.mockResolvedValue(false);

        await expect(userService.registerUser(command)).rejects.toThrow(
          new InvariantError({
            message: "Password must contain at least one lowercase letter",
            type: InvariantErrorType.PASSWORD_STRENGTH_ERROR,
          }),
        );
      });

      it("should reject password without uppercase letter", async () => {
        const command = createRegisterCommand(
          mockEmail,
          mockDisplayName,
          "password123!",
        );
        mockUserRepository.nextIdentity.mockResolvedValue(mockUserId);
        mockUserRepository.existsByEmail.mockResolvedValue(false);

        await expect(userService.registerUser(command)).rejects.toThrow(
          new InvariantError({
            message: "Password must contain at least one uppercase letter",
            type: InvariantErrorType.PASSWORD_STRENGTH_ERROR,
          }),
        );
      });

      it("should reject password without number", async () => {
        const command = createRegisterCommand(
          mockEmail,
          mockDisplayName,
          "Password!",
        );
        mockUserRepository.nextIdentity.mockResolvedValue(mockUserId);
        mockUserRepository.existsByEmail.mockResolvedValue(false);

        await expect(userService.registerUser(command)).rejects.toThrow(
          new InvariantError({
            message: "Password must contain at least one number",
            type: InvariantErrorType.PASSWORD_STRENGTH_ERROR,
          }),
        );
      });

      it("should reject password without special character", async () => {
        const command = createRegisterCommand(
          mockEmail,
          mockDisplayName,
          "Password123",
        );
        mockUserRepository.nextIdentity.mockResolvedValue(mockUserId);
        mockUserRepository.existsByEmail.mockResolvedValue(false);

        await expect(userService.registerUser(command)).rejects.toThrow(
          new InvariantError({
            message: "Password must contain at least one special character",
            type: InvariantErrorType.PASSWORD_STRENGTH_ERROR,
          }),
        );
      });

      it("should reject password shorter than 8 characters", async () => {
        const command = createRegisterCommand(
          mockEmail,
          mockDisplayName,
          "Pass1!",
        );
        mockUserRepository.nextIdentity.mockResolvedValue(mockUserId);
        mockUserRepository.existsByEmail.mockResolvedValue(false);

        await expect(userService.registerUser(command)).rejects.toThrow(
          new InvariantError({
            message: "Password must be at least 8 characters long",
            type: InvariantErrorType.PASSWORD_STRENGTH_ERROR,
          }),
        );
      });

      it("should accept password with all required criteria", async () => {
        const validPasswords = [
          "Password123!",
          "SecurePass1@",
          "MyP@ssw0rd",
          "C0mplex!Pass",
        ];

        for (const password of validPasswords) {
          jest.clearAllMocks();
          const command = createRegisterCommand(
            mockEmail,
            mockDisplayName,
            password,
          );
          mockUserRepository.nextIdentity.mockResolvedValue(mockUserId);
          mockUserRepository.existsByEmail.mockResolvedValue(false);
          mockUserRepository.save.mockResolvedValue(undefined);

          await expect(
            userService.registerUser(command),
          ).resolves.toBeDefined();
        }
      });

      it("should not save user when password validation fails", async () => {
        const command = createRegisterCommand(
          mockEmail,
          mockDisplayName,
          "weak",
        );
        mockUserRepository.nextIdentity.mockResolvedValue(mockUserId);
        mockUserRepository.existsByEmail.mockResolvedValue(false);

        await expect(userService.registerUser(command)).rejects.toThrow();
        expect(mockUserRepository.save).not.toHaveBeenCalled();
      });
    });

    describe("edge cases", () => {
      it("should handle repository errors gracefully", async () => {
        const command = createRegisterCommand();
        const repositoryError = new Error("Database connection failed");
        mockUserRepository.nextIdentity.mockRejectedValue(repositoryError);

        await expect(userService.registerUser(command)).rejects.toThrow(
          "Database connection failed",
        );
      });

      it("should handle email check errors", async () => {
        const command = createRegisterCommand();
        const emailCheck = new Error("Email check failed");

        mockUserRepository.nextIdentity.mockResolvedValue(mockUserId);
        mockUserRepository.existsByEmail.mockRejectedValue(emailCheck);

        await expect(userService.registerUser(command)).rejects.toThrow(
          "Email check failed",
        );
      });

      it("should handle user save errors", async () => {
        const command = createRegisterCommand();
        const saveError = new Error("Save operation failed");

        mockUserRepository.nextIdentity.mockResolvedValue(mockUserId);
        mockUserRepository.existsByEmail.mockResolvedValue(false);
        mockUserRepository.save.mockRejectedValue(saveError);

        await expect(userService.registerUser(command)).rejects.toThrow(
          "Save operation failed",
        );
      });

      it("should handle email with special characters", async () => {
        const specialEmail = "user+tag@example.co.uk";
        const command = createRegisterCommand(specialEmail);
        mockUserRepository.nextIdentity.mockResolvedValue(mockUserId);
        mockUserRepository.existsByEmail.mockResolvedValue(false);

        let savedUser: User | undefined;
        mockUserRepository.save.mockImplementation(async (user: User) => {
          savedUser = user;
        });

        await userService.registerUser(command);

        expect(savedUser).toBeDefined();
        expect(savedUser!.emailAddress).toBe(specialEmail);
      });

      it("should handle display name with unicode characters", async () => {
        const unicodeName = "María José García";
        const command = createRegisterCommand(mockEmail, unicodeName);
        mockUserRepository.nextIdentity.mockResolvedValue(mockUserId);
        mockUserRepository.existsByEmail.mockResolvedValue(false);

        let savedUser: User | undefined;
        mockUserRepository.save.mockImplementation(async (user: User) => {
          savedUser = user;
        });

        await userService.registerUser(command);

        expect(savedUser).toBeDefined();
        expect(savedUser!.displayName).toBe(unicodeName);
      });

      it("should hash password before saving", async () => {
        const plainPassword = "MySecurePass123!";
        const command = createRegisterCommand(
          mockEmail,
          mockDisplayName,
          plainPassword,
        );
        mockUserRepository.nextIdentity.mockResolvedValue(mockUserId);
        mockUserRepository.existsByEmail.mockResolvedValue(false);

        let savedUser: User | undefined;
        mockUserRepository.save.mockImplementation(async (user: User) => {
          savedUser = user;
        });

        await userService.registerUser(command);

        expect(savedUser).toBeDefined();
        expect(savedUser!.hashedPassword).not.toBe(plainPassword);
        expect(savedUser!.hashedPassword).toContain("$scrypt$");
      });
    });

    describe("integration scenarios", () => {
      it("should complete full registration flow successfully", async () => {
        const command: RegisterUserCommand = {
          emailAddress: "newuser@example.com",
          displayName: "New User",
          plainPassword: "SecurePassword123!",
        };

        mockUserRepository.nextIdentity.mockResolvedValue(
          new UserID("user_new_12345"),
        );
        mockUserRepository.existsByEmail.mockResolvedValue(false);
        mockUserRepository.save.mockResolvedValue(undefined);

        const result = await userService.registerUser(command);

        expect(result).toBeDefined();
        expect(result.userID).toBe("user_new_12345");
        expect(mockUserRepository.nextIdentity).toHaveBeenCalledTimes(1);
        expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(
          "newuser@example.com",
        );
        expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
      });
    });
  });
});
