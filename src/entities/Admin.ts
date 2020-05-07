import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('admin')
export class Admin {
  @PrimaryColumn()
  discord_id: string;
}
