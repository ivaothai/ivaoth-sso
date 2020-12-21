import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuthState } from '../entities/OAuthState';
import { User } from '../entities/User';
import { IvaoLoginController } from './ivao-login/ivao-login.controller';
import { DiscordOauthCallbackController } from './discord-oauth-callback/discord-oauth-callback.controller';
import { DiscordApiService } from './discord-api/discord-api.service';
import { UtilitiesService } from './utilities/utilities.service';
import { UpdateMemberController } from './update-member/update-member.controller';
import { NicknameUpdateController } from './nickname-update/nickname-update.controller';

interface DiscordInviteModuleConfig {
  discordClientId: string;
  discordClientSecret: string;
  discordCallbackUri: string;
  discordGuildId: string;
  discordBotToken: string;
  discordThisDivisionRole: string;
  discordOtherDivisionRole: string;
  discordThisDivisionStaffRole: string;
  discordOtherDivisionStaffRole: string;
  discordHQStaffRole: string;
  discordVerifiedUserRole: string;
  thisDivision: string;
  thisDivisionFirs: string[];
  discordBotRole: string;
  discordUnverifiedUserRole: string;
  discordManagedRoles: string[];
}

@Module({
  controllers: [
    IvaoLoginController,
    DiscordOauthCallbackController,
    UpdateMemberController,
    NicknameUpdateController
  ],
  providers: [DiscordApiService, UtilitiesService],
  imports: [TypeOrmModule.forFeature([User, OAuthState])]
})
export class DiscordInviteModule {
  static initialise(config: DiscordInviteModuleConfig): DynamicModule {
    return {
      module: DiscordInviteModule,
      imports: [TypeOrmModule.forFeature([User, OAuthState])],
      providers: [
        DiscordApiService,
        UtilitiesService,
        {
          provide: 'DISCORD_CLIENT_ID',
          useValue: config.discordClientId
        },
        {
          provide: 'DISCORD_CLIENT_SECRET',
          useValue: config.discordClientSecret
        },
        {
          provide: 'DISCORD_CALLBACK_URI',
          useValue: config.discordCallbackUri
        },
        {
          provide: 'DISCORD_GUILD_ID',
          useValue: config.discordGuildId
        },
        {
          provide: 'DISCORD_BOT_TOKEN',
          useValue: config.discordBotToken
        },
        {
          provide: 'DISCORD_THIS_DIVISION_ROLE',
          useValue: config.discordThisDivisionRole
        },
        {
          provide: 'DISCORD_OTHER_DIVISION_ROLE',
          useValue: config.discordOtherDivisionRole
        },
        {
          provide: 'DISCORD_THIS_DIVISION_STAFF_ROLE',
          useValue: config.discordThisDivisionStaffRole
        },
        {
          provide: 'DISCORD_OTHER_DIVISION_STAFF_ROLE',
          useValue: config.discordOtherDivisionStaffRole
        },
        {
          provide: 'DISCORD_HQ_STAFF_ROLE',
          useValue: config.discordHQStaffRole
        },
        {
          provide: 'DISCORD_VERIFIED_USER_ROLE',
          useValue: config.discordVerifiedUserRole
        },
        {
          provide: 'THIS_DIVISION',
          useValue: config.thisDivision
        },
        {
          provide: 'THIS_DIVISION_FIRS',
          useValue: config.thisDivisionFirs
        },
        {
          provide: 'DISCORD_BOT_ROLE',
          useValue: config.discordBotRole
        },
        {
          provide: 'DISCORD_UNVERIFIED_USER_ROLE',
          useValue: config.discordUnverifiedUserRole
        },
        {
          provide: 'DISCORD_MANAGED_ROLES',
          useValue: config.discordManagedRoles
        }
      ],
      controllers: [IvaoLoginController, DiscordOauthCallbackController]
    };
  }
}
