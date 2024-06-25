import { Request, Response } from "express";
import { User } from "../entity/User";
import { Message } from "../entity/Message";
import * as jwt from "jsonwebtoken";

export const signup = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = User.createUser(username, password);
    await user.hashPassword();
    await user.save();

    res.status(201).json({ message: "User created" });
  } catch (error) {
    res.status(500).json({ message: `Error creating user: ${error.message}` });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
};

export const me = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  try {
    if (!userId) {
      return res.status(400).json({ message: "Invalid user" });
    }

    const user = await User.findOneBy({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ username: user.username, followersCount: user.followersCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { password } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ message: "Invalid user" });
    }

    const user = await User.findOneBy({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.password = password;
    await user.hashPassword();
    await user.save();

    res.status(200).json({ message: "Password updated" });
  } catch (error) {
    res.status(500).json({ message: "Error updating password" });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await User.findOne({ where: { id: Number(id) } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ username: user.username, followersCount: user.followersCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
};

export const followUser = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ message: "Invalid user" });
    }

    const user = await User.findOne({
      where: { id: userId },
      relations: ["following"],
    });
    const targetUser = await User.findOne({ where: { id: Number(id) } });

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user!.following.some((u) => u.id === targetUser.id)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    user!.following.push(targetUser);
    targetUser.followersCount++;
    await user!.save();
    await targetUser.save();

    res.status(200).json({ message: "User followed" });
  } catch (error) {
    res.status(500).json({ message: "Error following user" });
  }
};

export const unfollowUser = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ message: "Invalid user" });
    }

    const user = await User.findOne({
      where: { id: userId },
      relations: ["following"],
    });

    const targetUser = await User.findOne({ where: { id: Number(id) } });
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    user!.following = user!.following.filter((u) => u.id !== targetUser.id);
    await user!.save();
    if (targetUser.followersCount > 0) {
      targetUser.followersCount--;
      await targetUser.save();
    }

    await targetUser.save();

    res.status(200).json({ message: "User unfollowed" });
  } catch (error) {
    res.status(500).json({ message: "Error unfollowing user" });
  }
};

export const createMessage = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  const { message } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ message: "Invalid user" });
    }

    const user = await User.findOne({ where: { id: Number(userId) } });
    const targetUser = await User.findOne({ where: { id: Number(id) } });

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const newMessage = Message.createMessage(user, targetUser, message);
    await newMessage.save();
    res.status(200).json({ message: "Message sent" });
  } catch (error) {
    res.status(500).json({ message: "Error sending message" });
  }
};

export const mostFollowed = async (req: Request, res: Response) => {
  try {
    const users = await User.find({
      select: { id: true, username: true, followersCount: true },
      order: { followersCount: "DESC" },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching most followed users" });
  }
};
