import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { Admin } from './entities/Admin';
import { AuthRequest } from './entities/AuthRequest';
import { User } from './entities/User';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(AuthRequest)
    private authRequestRepo: Repository<AuthRequest>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Admin) private adminRepo: Repository<Admin>
  ) {}

  /**
   * (General) This function triggers the webhook for the bot to refresh the user.
   * @param discord_id The user to update
   */
  private async notifyUpdate(discord_id: string): Promise<void> {
    const webHookUrl = `https://discordapp.com/api/webhooks/574992023195746370/${process.env['WEBHOOK_KEY']}`;
    await axios.post(webHookUrl, {
      content: `!refreshUser ${discord_id}`
    });
  }

  @Get('getUser')
  async getUser(
    @Query('discord_id') discord_id: string
  ): Promise<
    | {
        success: false;
      }
    | ({ success: true } & User)
  > {
    const user = this.userRepo.findOne({ discord_id });
    if (await user) {
      return {
        success: true,
        ...(await user)
      };
    } else {
      return {
        success: false
      };
    }
  }

  /**
   * (General) This update user's nickname in the server and trigger the bot to update the name.
   * @param discord_id The Discord user
   * @param nickname New nickname
   */
  @Patch('setNickname')
  async setNickname(
    @Body('discord_id') discord_id: string,
    @Body('nickname') nickname: string
  ): Promise<{ success: boolean }> {
    const user = this.userRepo.findOne({ discord_id });
    (await user).customNickname = nickname;
    void this.userRepo.save(await user);
    await this.notifyUpdate(discord_id);
    return {
      success: true
    };
  }

  /**
   * (General) Get all users in the database.
   */
  @Get('allUsers')
  async getAllUsers(): Promise<string[]> {
    const users = this.userRepo.find({});
    return (await users).map((u) => u.discord_id);
  }

  /**
   * (General) This endpoint checks if the user is allowed to perform administrative actions.
   * @param discord_id The Discord user
   */
  @Get('isAdmin')
  async isAdmin(
    @Query('discord_id') discord_id: string
  ): Promise<{ isAdmin: boolean }> {
    const admin = this.adminRepo.findOne({ discord_id });
    if (await admin) {
      return {
        isAdmin: true
      };
    } else {
      return {
        isAdmin: false
      };
    }
  }
}
