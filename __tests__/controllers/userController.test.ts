import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import {
  signup,
  login,
  me,
  updatePassword,
  getUser,
  followUser,
  unfollowUser,
  createMessage,
  mostFollowed,
} from "../../src/controllers/userController";
import { User } from "../../src/entity/User";
import { Message } from "../../src/entity/Message";

jest.mock("../../src/entity/User");
jest.mock("../../src/entity/Message");
jest.mock("jsonwebtoken");

describe("Controller Tests", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signup", () => {
    it("should create a new user successfully", async () => {
      const mockUserInstance = {
        hashPassword: jest.fn().mockResolvedValueOnce(undefined),
        save: jest.fn().mockResolvedValueOnce(undefined),
      };
      const createUserMock = jest.spyOn(User, "createUser");
      createUserMock.mockReturnValue(mockUserInstance as any);
      mockRequest.body = { username: "testuser", password: "password" };

      await signup(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User created",
      });
      expect(createUserMock).toHaveBeenCalled();
    });

    it("should handle error during signup", async () => {
      const mockError = new Error("Mock Error");
      const mockUserInstance = {
        hashPassword: jest.fn().mockRejectedValueOnce(mockError),
      };
      const createUserMock = jest.spyOn(User, "createUser");
      createUserMock.mockReturnValue(mockUserInstance as any);
      mockRequest.body = { username: "testuser", password: "password" };

      await signup(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Error creating user: Mock Error",
      });
    });
  });

  describe("login", () => {
    it("should login with correct credentials and return a token", async () => {
      mockRequest.body = { username: "testuser", password: "password" };

      const mockUser = {
        id: 1,
        username: "testuser",
        password: "password",
        comparePassword: jest.fn().mockReturnValueOnce(true),
      };
      User.findOne = jest.fn().mockResolvedValueOnce(mockUser);

      jest.spyOn(jwt, "sign").mockReturnValueOnce("mocked-token" as any);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ token: "mocked-token" });
    });

    it("should handle invalid credentials during login", async () => {
      User.findOne = jest.fn().mockResolvedValueOnce(undefined);
      mockRequest.body = { username: "testuser", password: "password" };

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid credentials",
      });
    });

    it("should handle error during login", async () => {
      User.findOne = jest.fn().mockRejectedValueOnce(new Error("Mock Error"));
      mockRequest.body = { username: "testuser", password: "password" };

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Error logging in",
      });
    });
  });

  describe("me", () => {
    it("should fetch user details successfully", async () => {
      const mockUser = { id: 1, username: "testuser", followersCount: 0 };
      (mockRequest as any).user = { id: 1 };
      User.findOneBy = jest.fn().mockResolvedValueOnce(mockUser);

      await me(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        username: "testuser",
        followersCount: 0,
      });
    });

    it("should handle invalid user during me", async () => {
      (mockRequest as any).user = {};
      await me(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid user",
      });
    });

    it("should handle user not found during me", async () => {
      (mockRequest as any).user = { id: 1 };
      User.findOneBy = jest.fn().mockResolvedValueOnce(undefined);

      await me(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });

    it("should handle error during me", async () => {
      (mockRequest as any).user = { id: 1 };
      User.findOneBy = jest.fn().mockRejectedValueOnce(new Error("Mock Error")); // Mocking an error

      await me(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Error fetching user",
      });
    });
  });

  describe("updatePassword", () => {
    it("should update user password successfully 2", async () => {
      const mockUser = {
        id: 1,
        password: "old_password",
        hashPassword: jest.fn().mockResolvedValueOnce(undefined),
        save: jest.fn().mockResolvedValueOnce(undefined),
      };
      (mockRequest as any).user = { id: 1 };
      (mockRequest as any).body = { password: "new_password" };

      User.findOneBy = jest.fn().mockResolvedValueOnce(mockUser);

      await updatePassword(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Password updated",
      });
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should handle invalid user during updatePassword", async () => {
      (mockRequest as any).user = {};
      (mockRequest as any).body = { password: "new_password" };
      await updatePassword(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid user",
      });
    });

    it("should handle user not found during updatePassword", async () => {
      (mockRequest as any).user = { id: 1 };
      (mockRequest as any).body = { password: "new_password" };
      User.findOneBy = jest.fn().mockResolvedValueOnce(undefined);

      await updatePassword(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });

    it("should handle error during updatePassword", async () => {
      (mockRequest as any).user = { id: 1 };
      (mockRequest as any).body = { password: "new_password" };
      User.findOneBy = jest.fn().mockRejectedValueOnce(new Error("Mock Error"));

      await updatePassword(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Error updating password",
      });
    });
  });

  describe("getUser", () => {
    it("should fetch user details successfully", async () => {
      const mockUser = { id: 1, username: "testuser", followersCount: 0 };
      mockRequest.params = { id: "1" };
      User.findOne = jest.fn().mockResolvedValueOnce(mockUser);

      await getUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        username: "testuser",
        followersCount: 0,
      });
    });

    it("should handle user not found during getUser", async () => {
      mockRequest.params = { id: "1" };
      User.findOne = jest.fn().mockResolvedValueOnce(undefined);

      await getUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });

    it("should handle error during getUser", async () => {
      mockRequest.params = { id: "1" };
      User.findOne = jest.fn().mockRejectedValueOnce(new Error("Mock Error"));

      await getUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Error fetching user",
      });
    });
  });

  describe("followUser", () => {
    it("should follow another user successfully", async () => {
      const mockUser = {
        id: 1,
        following: [],
        save: jest.fn().mockResolvedValueOnce(undefined),
      };
      const mockTargetUser = {
        id: 2,
        followersCount: 0,
        save: jest.fn().mockResolvedValueOnce(undefined),
      };
      (mockRequest as any).user = { id: 1 };
      mockRequest.params = { id: "2" };
      User.findOne = jest
        .fn()
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockTargetUser);

      await followUser(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User followed",
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockTargetUser.save).toHaveBeenCalled();
    });
    it("should handle invalid user during followUser", async () => {
      (mockRequest as any).user = {};
      mockRequest.params = { id: "2" };
      await followUser(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid user",
      });
    });
    it("should handle user not found during followUser", async () => {
      (mockRequest as any).user = { id: 1 };
      mockRequest.params = { id: "2" };
      const mockUser = { id: 1, following: [{ id: 2 }] };
      User.findOne = jest
        .fn()
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(undefined);

      await followUser(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });
    it("should handle already following during followUser", async () => {
      const mockUser = { id: 1, following: [{ id: 2 }] };
      const mockTargetUser = { id: 2, followersCount: 1 };

      (mockRequest as any).user = { id: 1 };
      mockRequest.params = { id: "2" };
      User.findOne = jest
        .fn()
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockTargetUser);

      await followUser(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Already following this user",
      });
    });
    it("should handle error during followUser", async () => {
      (mockRequest as any).user = { id: 1 };
      mockRequest.params = { id: "2" };
      User.findOne = jest.fn().mockRejectedValueOnce(new Error("Mock Error"));
      await followUser(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Error following user",
      });
    });
  });

  describe("unfollowUser", () => {
    it("should unfollow another user successfully", async () => {
      const mockUser = {
        id: 1,
        following: [{ id: 2 }],
        save: jest.fn().mockResolvedValueOnce(undefined),
      };
      const mockTargetUser = {
        id: 2,
        followersCount: 1,
        save: jest.fn().mockResolvedValueOnce(undefined),
      };
      (mockRequest as any).user = { id: 1 };
      mockRequest.params = { id: "2" };
      User.findOne = jest
        .fn()
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockTargetUser);

      await unfollowUser(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User unfollowed",
      });
    });
    it("should handle invalid user during unfollowUser", async () => {
      (mockRequest as any).user = {};
      mockRequest.params = { id: "2" };

      await unfollowUser(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid user",
      });
    });
    it("should handle user not found during unfollowUser", async () => {
      (mockRequest as any).user = { id: 1 };
      mockRequest.params = { id: "2" };
      const mockUser = { id: 1 };
      User.findOne = jest
        .fn()
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(undefined);

      await unfollowUser(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });
    it("should handle error during unfollowUser", async () => {
      (mockRequest as any).user = { id: 1 };
      mockRequest.params = { id: "2" };
      User.findOne = jest.fn().mockRejectedValueOnce(new Error("Mock Error"));
      await unfollowUser(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Error unfollowing user",
      });
    });
  });

  describe("createMessage", () => {
    it("should create a message successfully", async () => {
      (mockRequest as any).user = { id: 1 };
      mockRequest.params = { id: "2" };
      mockRequest.body = { message: "Hello" };
      const mockUser = { id: 1 };
      const mockTargetUser = { id: 2 };
      const mockMessage = { save: jest.fn().mockResolvedValueOnce(undefined) };
      User.findOne = jest
        .fn()
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockTargetUser);

      Message.createMessage = jest.fn().mockReturnValueOnce(mockMessage);

      await createMessage(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Message sent",
      });
      expect(mockMessage.save).toHaveBeenCalled();
    });
    it("should handle invalid user during createMessage", async () => {
      (mockRequest as any).user = {};
      mockRequest.params = { id: "1" };
      mockRequest.body = { message: "Hello" };

      await createMessage(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid user",
      });
    });
    it("should handle user not found during createMessage", async () => {
      (mockRequest as any).user = { id: 1 };
      mockRequest.params = { id: "1" };
      mockRequest.body = { message: "Hello" };
      const mockUser = { id: 1 };
      User.findOne = jest
        .fn()
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(undefined);

      await createMessage(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });
    it("should handle target user not found during createMessage", async () => {
      const mockUser = { id: 1 };
      mockRequest.params = { id: "1" };
      mockRequest.body = { message: "Hello" };
      (mockRequest as any).user = { id: 1 };
      User.findOne = jest
        .fn()
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(undefined);

      await createMessage(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });
    it("should handle error during createMessage", async () => {
      (mockRequest as any).user = { id: 1 };
      mockRequest.params = { id: "1" };
      mockRequest.body = { message: "Hello" };
      User.findOne = jest.fn().mockRejectedValueOnce(new Error("Mock Error"));
      await createMessage(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Error sending message",
      });
    });
  });

  describe("mostFollowed", () => {
    it("should fetch most followed users successfully", async () => {
      const mockUsers = [
        { id: 1, username: "user1", followersCount: 100 },
        { id: 2, username: "user2", followersCount: 50 },
      ];
      User.find = jest.fn().mockResolvedValueOnce(mockUsers);

      await mostFollowed(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
    });

    it("should handle error during mostFollowed", async () => {
      User.find = jest.fn().mockRejectedValueOnce(new Error("Mock Error"));

      await mostFollowed(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Error fetching most followed users",
      });
    });
  });
});
