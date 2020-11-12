import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { CreateAuthRequestTable1557146563440 } from './migrations/1557146563440-CreateAuthRequestTable';
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
