import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateAuthRequestTable1557146563440 } from './migrations/1557146563440-CreateAuthRequestTable';
import { AuthRequest } from './entities/AuthRequest';
import { User } from './entities/User';
import { CreateUserTable1557153360741 } from './migrations/1557153360741-CreateUserTable';
import { CreateNicknameOnUsers1557162358099 } from './migrations/1557162358099-CreateNicknameOnUsers';
import { APIKeyMiddleware } from './middlewares/APIKey.middleware';
import { CreateAdminTable } from './migrations/4-CreateAdminTable';
import { Admin } from './entities/Admin';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mariadb',
      timezone: 'Z',
      username: process.env['DB_USERNAME'],
      password: process.env['DB_PASSWORD'],
      database: process.env['DB_NAME'],
      entities: [AuthRequest, User, Admin],
      migrations: [
        CreateAuthRequestTable1557146563440,
        CreateUserTable1557153360741,
        CreateNicknameOnUsers1557162358099,
        CreateAdminTable
      ],
      migrationsRun: true
    }),
    TypeOrmModule.forFeature([AuthRequest, User, Admin])
  ],
  controllers: [AppController],
  providers: []
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void | MiddlewareConsumer {
    consumer
      .apply(APIKeyMiddleware)
      .exclude('discord')
      .forRoutes(AppController);
  }
}
