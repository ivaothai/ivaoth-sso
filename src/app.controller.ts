import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Admin } from './entities/Admin';
import { AuthRequest } from './entities/AuthRequest';
import { User } from './entities/User';
import { UserData } from './interfaces';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(AuthRequest)
    private authRequestRepo: Repository<AuthRequest>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Admin) private adminRepo: Repository<Admin>
  ) {}

  /**
   * (Old verification flow) Redirect URL from IVAO Login API
   * @param ivaoToken Token from IVAO Login API
   * @param key The key to match the Discord user
   */
  @Get('discord')
  async discordAuth(
    @Query('IVAOTOKEN') ivaoToken: string,
    @Query('key') key: string
  ): Promise<string> {
    if (ivaoToken === 'error') {
      return 'IVAO Login API is not configured for this domain';
    } else {
      const authRequest = this.authRequestRepo.findOne({
        where: {
          key
        }
      });
      if (await authRequest) {
        const ivaoApi = `https://login.ivao.aero/api.php?type=json&token=${ivaoToken}`;
        const userData = (await axios.get<UserData>(ivaoApi)).data;
        let user = await this.userRepo.findOne({
          discord_id: (await authRequest).discord_id
        });
        if (!user) {
          user = this.userRepo.create({
            ...userData,
            discord_id: (await authRequest).discord_id
          });
        } else {
          this.userRepo.merge(user, { ...userData });
        }
        // this.authRequestRepo.delete(await authRequest);
        await this.userRepo.save(user);
        await this.notifyUpdate(user.discord_id);
        return 'Success';
      } else {
        return 'Error';
      }
    }
  }

  /**
   * (Old verification flow) This function triggers the webhook for the bot to refresh the user.
   * @param discord_id The user to update
   */
  private async notifyUpdate(discord_id: string): Promise<void> {
    const webHookUrl = `https://discordapp.com/api/webhooks/574992023195746370/${process.env['WEBHOOK_KEY']}`;
    await axios.post(webHookUrl, {
      content: `!refreshUser ${discord_id}`
    });
  }

  /**
   * (Old verification flow) This endpoint is called by the bot to request a unique token that ties to a Discord user.
   * @param discord_id The user that request the verification.
   */
  @Post('requestDiscordVerification')
  async requestDiscordVerification(
    @Body('discord_id') discord_id: string
  ): Promise<{
    key: string;
  }> {
    const key = uuidv4();
    const authRequest = this.authRequestRepo.create({
      discord_id,
      key
    });
    await this.authRequestRepo.save(authRequest);
    return {
      key
    };
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
    this.userRepo.save(await user);
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
