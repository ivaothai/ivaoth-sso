import { Entity, Column } from 'typeorm';

@Entity('admin')
export class Admin {
  @Column()
  discord_id: string;
}
