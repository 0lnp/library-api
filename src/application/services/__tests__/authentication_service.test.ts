import { AuthenticationService } from "../authentication_service";
import { type UserRepository } from "src/domain/repositories/user_repository";
import {
  type JoseTokenManager,
  TokenType,
} from "src/shared/utilities/jose_token_manager";
import { type AuthenticateDTO } from "../../dtos/authenticate_dto";
import { User } from "src/domain/aggregates/user";
import { UserID } from "src/domain/value_objects/user_id";
import { RoleAssignment } from "src/domain/value_objects/role_assignment";
import { Role, RoleName } from "src/domain/value_objects/role";
import { SystemRoles } from "src/domain/value_objects/system_roles";
import { jest } from "@jest/globals";

describe("AuthenticationService", () => {
  let authenticationService: AuthenticationService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockJwtTokenManager: jest.Mocked<JoseTokenManager>;

  const mockUserId = new UserID("user_12345");
  const mockEmail = "test@example.com";
  const mockPassword = "SecurePassword123!";
  const mockAccessToken = "mock.access.token";
  const mockRefreshToken = "mock.refresh.token";

  beforeEach(() => {
    mockUserRepository = {
      findOne: jest.fn(),
    };

    mockJwtTokenManager = {
      generate: jest.fn(),
      verify: jest.fn(),
    } as unknown as jest.Mocked<JoseTokenManager>;

    authenticationService = new AuthenticationService(
      mockUserRepository,
      mockJwtTokenManager,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("authenticate", () => {
    const createMockUser = (): User => {
      const rolePermissions = SystemRoles.rolePermissions(RoleName.CUSTOMER);
      const roleAssignment = new RoleAssignment(
        new Role(RoleName.CUSTOMER, rolePermissions),
        new Date(),
        "system",
      );

      return new User({
        id: mockUserId,
        displayName: "Test User",
        emailAddress: mockEmail,
        hashedPassword: "hashed_password_value",
        roleAssignment,
        lastLoginAt: null,
        loginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    };

    const createAuthenticateDTO = (
      email: string = mockEmail,
      password: string = mockPassword,
    ): AuthenticateDTO => ({
      email,
      password,
    });

    describe("successful authentication", () => {
      it("should return access and refresh tokens when credentials are valid", async () => {
        const mockUser = createMockUser();
        const dto = createAuthenticateDTO();

        mockUserRepository.findOne.mockResolvedValue(mockUser);
        jest.spyOn(mockUser, "login").mockResolvedValue(true);
        mockJwtTokenManager.generate
          .mockResolvedValueOnce(mockAccessToken)
          .mockResolvedValueOnce(mockRefreshToken);

        const result = await authenticationService.authenticate(dto);

        expect(result).toEqual({
          accessToken: mockAccessToken,
          refreshToken: mockRefreshToken,
        });
        expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
        expect(mockUserRepository.findOne).toHaveBeenCalledWith({
          emailAddress: dto.email,
        });
        expect(mockUser.login).toHaveBeenCalledTimes(1);
        expect(mockUser.login).toHaveBeenCalledWith(dto.password);
      });

      it("should generate tokens with correct payload", async () => {
        const mockUser = createMockUser();
        const dto = createAuthenticateDTO();

        mockUserRepository.findOne.mockResolvedValue(mockUser);
        jest.spyOn(mockUser, "login").mockResolvedValue(true);
        mockJwtTokenManager.generate
          .mockResolvedValueOnce(mockAccessToken)
          .mockResolvedValueOnce(mockRefreshToken);

        await authenticationService.authenticate(dto);

        const expectedPayload = {
          sub: mockUser.id,
          role: mockUser.roleAssignment.role.name,
        };

        expect(mockJwtTokenManager.generate).toHaveBeenCalledTimes(2);
        expect(mockJwtTokenManager.generate).toHaveBeenNthCalledWith(
          1,
          expectedPayload,
          TokenType.ACCESS,
        );
        expect(mockJwtTokenManager.generate).toHaveBeenNthCalledWith(
          2,
          expectedPayload,
          TokenType.REFRESH,
        );
      });

      it("should handle users with different roles", async () => {
        const adminRolePermissions = SystemRoles.rolePermissions(
          RoleName.ADMIN,
        );
        const adminRoleAssignment = new RoleAssignment(
          new Role(RoleName.ADMIN, adminRolePermissions),
          new Date(),
          "system",
        );

        const adminUser = new User({
          id: mockUserId,
          displayName: "Admin User",
          emailAddress: "admin@example.com",
          hashedPassword: "hashed_password",
          roleAssignment: adminRoleAssignment,
          lastLoginAt: null,
          loginAttempts: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const dto = createAuthenticateDTO("admin@example.com", mockPassword);

        mockUserRepository.findOne.mockResolvedValue(adminUser);
        jest.spyOn(adminUser, "login").mockResolvedValue(true);
        mockJwtTokenManager.generate
          .mockResolvedValueOnce(mockAccessToken)
          .mockResolvedValueOnce(mockRefreshToken);

        const result = await authenticationService.authenticate(dto);

        expect(result).toBeDefined();
        expect(mockJwtTokenManager.generate).toHaveBeenCalledWith(
          expect.objectContaining({
            role: RoleName.ADMIN,
          }),
          expect.anything(),
        );
      });
    });

    describe("failed authentication - user not found", () => {
      it("should throw error when user does not exist", async () => {
        const dto = createAuthenticateDTO();
        mockUserRepository.findOne.mockResolvedValue(null);

        await expect(authenticationService.authenticate(dto)).rejects.toThrow(
          "Invalid email or password",
        );
        expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
        expect(mockJwtTokenManager.generate).not.toHaveBeenCalled();
      });

      it("should throw error with generic message for non-existent email", async () => {
        const dto = createAuthenticateDTO(
          "nonexistent@example.com",
          mockPassword,
        );
        mockUserRepository.findOne.mockResolvedValue(null);

        await expect(authenticationService.authenticate(dto)).rejects.toThrow(
          "Invalid email or password",
        );
      });
    });

    describe("failed authentication - invalid password", () => {
      it("should throw error when password is invalid", async () => {
        const mockUser = createMockUser();
        const dto = createAuthenticateDTO(mockEmail, "WrongPassword123!");

        mockUserRepository.findOne.mockResolvedValue(mockUser);
        jest.spyOn(mockUser, "login").mockResolvedValue(false);

        await expect(authenticationService.authenticate(dto)).rejects.toThrow(
          "Invalid email or password",
        );
        expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
        expect(mockUser.login).toHaveBeenCalledTimes(1);
        expect(mockJwtTokenManager.generate).not.toHaveBeenCalled();
      });

      it("should not generate tokens when password verification fails", async () => {
        const mockUser = createMockUser();
        const dto = createAuthenticateDTO();

        mockUserRepository.findOne.mockResolvedValue(mockUser);
        jest.spyOn(mockUser, "login").mockResolvedValue(false);

        await expect(authenticationService.authenticate(dto)).rejects.toThrow();
        expect(mockJwtTokenManager.generate).not.toHaveBeenCalled();
      });
    });

    describe("edge cases", () => {
      it("should handle repository errors gracefully", async () => {
        const dto = createAuthenticateDTO();
        const repositoryError = new Error("Database connection failed");
        mockUserRepository.findOne.mockRejectedValue(repositoryError);

        await expect(authenticationService.authenticate(dto)).rejects.toThrow(
          "Database connection failed",
        );
        expect(mockJwtTokenManager.generate).not.toHaveBeenCalled();
      });

      it("should handle token generation errors", async () => {
        const mockUser = createMockUser();
        const dto = createAuthenticateDTO();
        const tokenError = new Error("Token generation failed");

        mockUserRepository.findOne.mockResolvedValue(mockUser);
        jest.spyOn(mockUser, "login").mockResolvedValue(true);
        mockJwtTokenManager.generate.mockRejectedValue(tokenError);

        await expect(authenticationService.authenticate(dto)).rejects.toThrow(
          "Token generation failed",
        );
        expect(mockJwtTokenManager.generate).toHaveBeenCalledTimes(1);
      });

      it("should handle token generation failure for refresh token", async () => {
        const mockUser = createMockUser();
        const dto = createAuthenticateDTO();
        const tokenError = new Error("Refresh token generation failed");

        mockUserRepository.findOne.mockResolvedValue(mockUser);
        jest.spyOn(mockUser, "login").mockResolvedValue(true);
        mockJwtTokenManager.generate
          .mockResolvedValueOnce(mockAccessToken)
          .mockRejectedValueOnce(tokenError);

        await expect(authenticationService.authenticate(dto)).rejects.toThrow(
          "Refresh token generation failed",
        );
        expect(mockJwtTokenManager.generate).toHaveBeenCalledTimes(2);
      });
    });

    describe("input validation", () => {
      it("should handle empty email", async () => {
        const dto = createAuthenticateDTO("", mockPassword);
        mockUserRepository.findOne.mockResolvedValue(null);

        await expect(authenticationService.authenticate(dto)).rejects.toThrow(
          "Invalid email or password",
        );
      });

      it("should handle malformed email", async () => {
        const dto = createAuthenticateDTO("not-an-email", mockPassword);
        mockUserRepository.findOne.mockResolvedValue(null);

        await expect(authenticationService.authenticate(dto)).rejects.toThrow(
          "Invalid email or password",
        );
      });
    });

    describe("security considerations", () => {
      it("should provide same error message for non-existent user and wrong password", async () => {
        const dto1 = createAuthenticateDTO(
          "nonexistent@example.com",
          mockPassword,
        );
        mockUserRepository.findOne.mockResolvedValue(null);

        let error1: Error | undefined;
        try {
          await authenticationService.authenticate(dto1);
        } catch (e) {
          error1 = e as Error;
        }

        jest.clearAllMocks();
        const mockUser = createMockUser();
        const dto2 = createAuthenticateDTO(mockEmail, "WrongPassword");
        mockUserRepository.findOne.mockResolvedValue(mockUser);
        jest.spyOn(mockUser, "login").mockResolvedValue(false);

        let error2: Error | undefined;
        try {
          await authenticationService.authenticate(dto2);
        } catch (e) {
          error2 = e as Error;
        }

        expect(error1?.message).toBe(error2?.message);
        expect(error1?.message).toBe("Invalid email or password");
      });
    });
  });
});
