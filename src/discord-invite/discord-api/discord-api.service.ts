import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import qs from 'qs';
import { User } from '../../entities/User';
import { TokenData } from '../../interfaces';
import { UtilitiesService } from '../utilities/utilities.service';

@Injectable()
export class DiscordApiService {
  constructor(
    private utils: UtilitiesService,
    @Inject('DISCORD_CLIENT_ID') private discordClientId: string,
    @Inject('DISCORD_CLIENT_SECRET') private discordClientSecret: string,
    @Inject('DISCORD_CALLBACK_URI') private discordCallbackUri: string,
    @Inject('DISCORD_GUILD_ID') private discordGuildId: string,
    @Inject('DISCORD_BOT_TOKEN') private discordBotToken: string
  ) {}

  async getDiscordUserIdFromAccessToken(
    token_type: string,
    access_token: string
  ): Promise<string> {
    const identityUrl = 'https://discord.com/api/users/@me';
    const identityResponse = (
      await axios.get<{ id: string }>(identityUrl, {
        headers: {
          authorization: `${token_type} ${access_token}`
        }
      })
    ).data;
    return identityResponse.id;
  }

  async getTokens(code: string): Promise<TokenData> {
    const tokenUrl = 'https://discord.com/api/oauth2/token';
    const tokenData = {
      client_id: this.discordClientId,
      client_secret: this.discordClientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.discordCallbackUri,
      scope: 'identify guilds.join'
    };
    const tokenResponse = (
      await axios.post<TokenData>(tokenUrl, qs.stringify(tokenData), {
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
      })
    ).data;
    return tokenResponse;
  }

  async tryKickUser(user: User): Promise<void> {
    const removeUserUrl = `https://discord.com/api/guilds/${this.discordGuildId}/members/${user.discord_id}`;
    try {
      await axios.delete(removeUserUrl, {
        headers: {
          authorization: `Bot ${this.discordBotToken}`
        }
      });
    } catch {
      // Continues regardless of error
    }
  }

  async joinUserToGuild(
    discordId: string,
    tokenResponse: TokenData,
    user: User
  ): Promise<void> {
    const joinGuildUrl = `https://discord.com/api/guilds/${this.discordGuildId}/members/${discordId}`;
    await axios.put(
      joinGuildUrl,
      {
        access_token: tokenResponse.access_token,
        nick: this.utils.calculateNickname(
          user.firstname,
          user.lastname,
          user.vid,
          user.staff
        ),
        roles: this.utils.calculateRoles(user)
      },
      {
        headers: {
          authorization: `Bot ${this.discordBotToken}`
        }
      }
    );
  }
}
