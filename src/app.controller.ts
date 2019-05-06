import { Controller, Get, Query, Post, Body, Patch } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as uuid from 'uuid/v4';
import { AuthRequest } from './entities/AuthRequest';
import { Repository } from 'typeorm';
import { User } from './entities/User';

interface UserData {
  vid: string;
  firstname: string;
  lastname: string;
  rating: number;
  ratingatc?: number;
  ratingpilot?: number;
  division: string;
  country: string;
  staff?: string;
}

@Controller()
export class AppController {
  constructor(
    @InjectRepository(AuthRequest)
    private authRequestRepo: Repository<AuthRequest>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  @Get('discord')
  async discordAuth(
    @Query('IVAOTOKEN') ivaoToken: string,
    @Query('key') key: string,
  ): Promise<string> {
    if (ivaoToken === 'error') {
      return 'IVAO Login API is not configured for this domain';
    } else {
      const authRequest = this.authRequestRepo.findOne({
        where: {
          key,
        },
      });
      if (await authRequest) {
        const ivaoApi = `https://login.ivao.aero/api.php?type=json&token=${ivaoToken}`;
        const userData = (await axios.get<UserData>(ivaoApi)).data;
        let user = await this.userRepo.findOne({
          discord_id: (await authRequest).discord_id,
        });
        if (!user) {
          user = this.userRepo.create({
            ...userData,
            discord_id: (await authRequest).discord_id,
          });
        } else {
          this.userRepo.merge(user, { ...userData });
        }
        // this.authRequestRepo.delete(await authRequest);
        await this.userRepo.save(user);
        const webHookUrl = `https://discordapp.com/api/webhooks/574992023195746370/${
          process.env['WEBHOOK_KEY']
        }`;
        await axios.post(webHookUrl, {
          content: `!refreshUser ${user.discord_id}`,
        });
        return 'Success';
      } else {
        return 'Error';
      }
    }
  }

  @Post('requestDiscordVerification')
  async requestDiscordVerification(@Body('discord_id') discord_id: string) {
    const key = uuid();
    const authRequest = this.authRequestRepo.create({
      discord_id,
      key,
    });
    await this.authRequestRepo.save(authRequest);
    return {
      key,
    };
  }

  @Get('getUser')
  async getUser(@Query('discord_id') discord_id: string) {
    const user = this.userRepo.findOne({ discord_id });
    if (await user) {
      return {
        success: true,
        ...user,
      };
    } else {
      return {
        success: false,
      };
    }
  }

  @Patch('setNickname')
  async setNickname(
    @Body('discord_id') discord_id: string,
    @Body('nickname') nickname: string,
  ) {
    const user = this.userRepo.findOne({ discord_id });
    (await user).customNickname = nickname;
    this.userRepo.save(await user);
    return {
      success: true,
    };
  }

  @Get('allUsers')
  async getAllUsers() {
    const users = this.userRepo.find({});
    return (await users).map(u => u.discord_id);
  }
}
