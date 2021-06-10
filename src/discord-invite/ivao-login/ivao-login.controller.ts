import { Controller, Get, Inject, Query, Redirect, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { OAuthState } from '../../entities/OAuthState';
import { User } from '../../entities/User';
import { UserData } from '../../interfaces';

@Controller('discord-invite')
export class IvaoLoginController {
  constructor(
    @Inject('DISCORD_CLIENT_ID') private discordClientId: string,
    @Inject('DISCORD_CALLBACK_URI') private discordCallbackUri: string,
    @InjectRepository(OAuthState)
    private oauthStateRepository: Repository<OAuthState>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  /**
   * (New verification flow) This endpoint will redirect the user to the Discord OAuth page.
   * @param ivaoToken The token from IVAO Login API
   */
  @Get()
  async discordInvite(
    @Query('IVAOTOKEN') ivaoToken: string,
    @Res() res: Response
  ): Promise<{
    url: string;
    statusCode: number;
  }> {
    if (ivaoToken === 'error') {
      return {
        url: 'https://ivao.aero',
        statusCode: 302
      };
    } else {
      const ivaoApi = `https://login.ivao.aero/api.php?type=json&token=${ivaoToken}`;
      const userData = (await axios.get<UserData>(ivaoApi)).data;
      let user = await this.userRepository.findOne({
        where: {
          vid: userData.vid
        }
      });

      if (!user) {
        user = this.userRepository.create({
          ...userData,
          discord_id: ''
        });
      } else {
        user = this.userRepository.merge(user, { ...userData });
      }
      await this.userRepository.save(user);

      if (user.consentTime) {
        const key = uuidv4();

        const state = this.oauthStateRepository.create({
          state: key,
          user
        });
        await this.oauthStateRepository.save(state);

        const authorizeUrl = new URL(
          'https://discord.com/api/oauth2/authorize'
        );
        authorizeUrl.searchParams.set('response_type', 'code');
        authorizeUrl.searchParams.set('client_id', this.discordClientId);
        authorizeUrl.searchParams.set('scope', 'identify guilds.join');
        authorizeUrl.searchParams.set(
          'redirect_uri',
          this.discordCallbackUri
        );
        authorizeUrl.searchParams.set('state', key);
        // return {
        //   url: authorizeUrl.href,
        //   statusCode: 302
        // };
        res.redirect(authorizeUrl.href);
      } else {
        res.render('consent');
      }
    }
  }
}
