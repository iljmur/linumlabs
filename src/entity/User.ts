import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToMany,
  OneToMany,
  JoinTable,
} from "typeorm";
import * as bcrypt from "bcryptjs";
import { Message } from "./Message";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ default: 0 })
  followersCount: number;

  @ManyToMany(() => User, (user) => user.following)
  @JoinTable()
  followers!: User[];

  @ManyToMany(() => User, (user) => user.followers)
  following!: User[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages: Message[];

  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(password: string) {
    return await bcrypt.compare(password, this.password);
  }

  static createUser(username: string, password: string) {
    const user = new User();
    user.username = username;
    user.password = password;
    user.followersCount = 0;
    user.followers = [];
    user.following = [];
    return user;
  }
}
