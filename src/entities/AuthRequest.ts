import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('auth_request')
export class AuthRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  discord_id: string;

  @Column()
  key: string;
}
