import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  BaseEntity,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.sentMessages)
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMessages)
  receiver: User;

  // Factory method for creating a new message
  static createMessage(sender: User, receiver: User, message: string) {
    const newMessage = new Message();
    newMessage.createdAt = new Date();
    newMessage.sender = sender;
    newMessage.receiver = receiver;
    newMessage.content = message;
    return newMessage;
  }
}
