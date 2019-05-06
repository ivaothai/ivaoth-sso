import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  discord_id: string;
  @Column()
  vid: string;
  @Column()
  firstname: string;
  @Column()
  lastname: string;
  @Column()
  rating: number;
  @Column()
  ratingatc: number;
  @Column()
  ratingpilot: number;
  @Column()
  division: string;
  @Column()
  country: string;
  @Column()
  staff: string;
  @Column()
  customNickname: string;
}
