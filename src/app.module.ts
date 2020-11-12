import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { DiscordInviteModule } from './discord-invite/discord-invite.module';
import { Admin } from './entities/Admin';
import { AuthRequest } from './entities/AuthRequest';
import { OAuthState } from './entities/OAuthState';
import { User } from './entities/User';
import { APIKeyMiddleware } from './middlewares/APIKey.middleware';
import { CreateAuthRequestTable1557146563440 } from './migrations/1557146563440-CreateAuthRequestTable';
import { CreateUserTable1557153360741 } from './migrations/1557153360741-CreateUserTable';
import { CreateNicknameOnUsers1557162358099 } from './migrations/1557162358099-CreateNicknameOnUsers';
import { CreateAdminTable1588883056001 } from './migrations/1588883056001-CreateAdminTable';
import { CreateOAuthStateTable1605167513355 } from './migrations/1605167513355-CreateOAuthStateTable';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mariadb',
      timezone: 'Z',
      host: process.env['DB_HOST'],
      username: process.env['DB_USERNAME'],
      password: process.env['DB_PASSWORD'],
      database: process.env['DB_NAME'],
      entities: [AuthRequest, User, Admin, OAuthState],
      migrations: [
        CreateAuthRequestTable1557146563440,
        CreateUserTable1557153360741,
        CreateNicknameOnUsers1557162358099,
        CreateAdminTable1588883056001,
        CreateOAuthStateTable1605167513355
      ],
      migrationsRun: true
    }),
    TypeOrmModule.forFeature([AuthRequest, User, Admin, OAuthState]),
    DiscordInviteModule.initialise({
      discordBotToken: process.env['DISCORD_BOT_TOKEN'],
      discordCallbackUri: process.env['DISCORD_CALLBACK_URI'],
      discordClientId: process.env['DISCORD_CLIENT_ID'],
      discordClientSecret: process.env['DISCORD_CLIENT_SECRET'],
      discordGuildId: process.env['DISCORD_GUILD_ID'],
      discordHQStaffRole: process.env['DISCORD_HQ_STAFF_ROLE'],
      discordOtherDivisionRole: process.env['DISCORD_OTHER_DIVISION_ROLE'],
      discordOtherDivisionStaffRole:
        process.env['DISCORD_OTHER_DIVISION_STAFF_ROLE'],
      discordThisDivisionRole: process.env['DISCORD_THIS_DIVISION_ROLE'],
      discordThisDivisionStaffRole:
        process.env['DISCORD_THIS_DIVISION_STAFF_ROLE'],
      discordVerifiedUserRole: process.env['DISCORD_VERIFIED_USER_ROLE'],
      thisDivision: process.env['THIS_DIVISION'],
      thisDivisionFirs: process.env['THIS_DIVISION_FIRS'].split(':')
    })
  ],
  controllers: [AppController],
  providers: []
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void | MiddlewareConsumer {
    consumer
      .apply(APIKeyMiddleware)
      .exclude('discord', 'discord-invite', 'discord-callback')
      .forRoutes(AppController);
  }
}
