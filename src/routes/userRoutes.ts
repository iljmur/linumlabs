import express from "express";
import * as UserController from "../controllers/userController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

router.post("/signup", UserController.signup);
router.post("/login", UserController.login);

router.get("/me", authenticate, UserController.me);
router.put("/me/update-password", authenticate, UserController.updatePassword);

router.get("/user/:id", UserController.getUser);
router.post("/user/:id/follow", authenticate, UserController.followUser);
router.delete("/user/:id/unfollow", authenticate, UserController.unfollowUser);
router.post(
  "/user/:id/create-message",
  authenticate,
  UserController.createMessage
);

router.get("/most-followed", UserController.mostFollowed);

export default router;
