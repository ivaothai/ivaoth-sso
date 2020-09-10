import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Patch,
  Redirect
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from './entities/AuthRequest';
import { Repository } from 'typeorm';
import { User } from './entities/User';
import { Admin } from './entities/Admin';
import * as qs from 'qs';

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

interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

@Controller()
export class AppController {
  constructor(
    @InjectRepository(AuthRequest)
    private authRequestRepo: Repository<AuthRequest>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Admin) private adminRepo: Repository<Admin>
  ) {}

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

  private async notifyUpdate(discord_id: string): Promise<void> {
    const webHookUrl = `https://discordapp.com/api/webhooks/574992023195746370/${process.env['WEBHOOK_KEY']}`;
    await axios.post(webHookUrl, {
      content: `!refreshUser ${discord_id}`
    });
  }

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

  @Get('allUsers')
  async getAllUsers(): Promise<string[]> {
    const users = this.userRepo.find({});
    return (await users).map((u) => u.discord_id);
  }

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

  @Get('discord-invite')
  @Redirect()
  async discordInvite(
    @Query('IVAOTOKEN') ivaoToken: string
  ): Promise<
    | {
        url: string;
        statusCode: number;
      }
    | string
  > {
    if (ivaoToken === 'error') {
      return 'IVAO Login API is not configured for this domain';
    } else {
      const ivaoApi = `https://login.ivao.aero/api.php?type=json&token=${ivaoToken}`;
      const userData = (await axios.get<UserData>(ivaoApi)).data;
      const key = uuidv4();
      const authRequest = this.authRequestRepo.create({
        discord_id: userData.vid,
        key
      });
      this.authRequestRepo.save(authRequest);
      let user = await this.userRepo.findOne({
        vid: userData.vid
      });
      if (!user) {
        user = this.userRepo.create({
          ...userData,
          discord_id: ''
        });
      } else {
        this.userRepo.merge(user, { ...userData });
      }
      this.userRepo.save(user);
      const callbackUrl = new URL('https://sso.th.ivao.aero/discord-callback');

      const authorizeUrl = new URL('https://discord.com/api/oauth2/authorize');
      authorizeUrl.searchParams.set('response_type', 'code');
      authorizeUrl.searchParams.set(
        'client_id',
        process.env['DISCORD_CLIENT_ID']
      );
      authorizeUrl.searchParams.set('scope', 'identify guilds.join');
      authorizeUrl.searchParams.set('redirect_uri', callbackUrl.href);
      authorizeUrl.searchParams.set('state', key);
      return {
        url: authorizeUrl.href,
        statusCode: 302
      };
    }
  }

  @Get('discord-callback')
  async discordCallback(
    @Query('code') code: string,
    @Query('state') state: string
  ): Promise<string> {
    const authRequest = this.authRequestRepo.findOne({
      where: {
        key: state
      }
    });
    if (await authRequest) {
      const user = await this.userRepo.findOne({
        vid: (await authRequest).discord_id
      });
      if (!user) {
        return 'Error';
      }
      const tokenUrl = 'https://discord.com/api/oauth2/token';
      const tokenData = {
        client_id: process.env['DISCORD_CLIENT_ID'],
        client_secret: process.env['DISCORD_CLIENT_SECRET'],
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'https://sso.th.ivao.aero/discord-callback',
        scope: 'identify guilds.join'
      };
      const tokenResponse = (
        await axios.post<TokenData>(tokenUrl, qs.stringify(tokenData), {
          headers: {
            'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
          }
        })
      ).data;

      const identityUrl = 'https://discord.com/api/users/@me';
      const identityResponse = (
        await axios.get<{ id: string }>(identityUrl, {
          headers: {
            authorization: `${tokenResponse.token_type} ${tokenResponse.access_token}`
          }
        })
      ).data;

      const joinGuildUrl = `https://discord.com/api/guilds/${process.env['DISCORD_GUILD_ID']}/members/${identityResponse.id}`;
      const joinGuildResponse = (
        await axios.put(
          joinGuildUrl,
          {
            access_token: tokenResponse.access_token,
            nick: `${user.vid} ${user.firstname} ${user.lastname}`.substr(
              0,
              32
            ),
            roles: (process.env['DISCORD_ROLES'] as string)
              .split(',')
              .map((s) => s.trim())
          },
          {
            headers: {
              authorization: `Bot ${process.env['DISCORD_BOT_TOKEN']}`
            }
          }
        )
      ).data;
      return joinGuildResponse;
    } else {
      return 'Error';
    }
  }
}
