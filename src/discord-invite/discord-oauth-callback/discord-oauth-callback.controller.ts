import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuthState } from '../../entities/OAuthState';
import { User } from '../../entities/User';
import { DiscordApiService } from '../discord-api/discord-api.service';

@Controller('discord-oauth-callback')
export class DiscordOauthCallbackController {
  constructor(
    @InjectRepository(OAuthState)
    private oauthStateRepository: Repository<OAuthState>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private apiService: DiscordApiService
  ) {}
  /**
   * (New verification flow) This is the URI Callback from Discord OAuth.
   * @param code The authorisation code from Discord.
   * @param state The state that we sent with OAuth request.
   */
  @Get()
  async discordCallback(
    @Query('code') code: string,
    @Query('state') state: string
  ): Promise<string> {
    const oauthState = this.oauthStateRepository.findOne({
      where: {
        state
      },
      relations: ['user']
    });

    const user = (await oauthState).user;

    if (await oauthState) {
      const tokenResponse = await this.apiService.getTokens(code);

      const discordId = await this.apiService.getDiscordUserIdFromAccessToken(
        tokenResponse.token_type,
        tokenResponse.access_token
      );

      if (user.discord_id && user.discord_id !== discordId) {
        await this.apiService.tryKickUser(user);
      }

      user.discord_id = discordId;
      await this.userRepository.save(user);

      await this.apiService.joinUserToGuild(discordId, tokenResponse, user);

      return 'Success';
    } else {
      return 'Invalid state';
    }
  }
}
