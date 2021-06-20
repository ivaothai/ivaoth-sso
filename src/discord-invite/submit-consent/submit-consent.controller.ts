import { Body, Controller, Post, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { User } from '../../entities/User';
import { UtilitiesService } from '../utilities/utilities.service';

@Controller('submit-consent')
export class SubmitConsentController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private utilitiesService: UtilitiesService
  ) {}

  @Post()
  async submitConsent(
    @Body('consent') consent: string,
    @Body('_token') vid: string,
    @Res() res: Response
  ) {
    if (consent !== 'consent') {
      return;
    }

    let user = await this.userRepository.findOne({
      where: {
        vid
      }
    });

    user = this.userRepository.merge(user, { consentTime: new Date() });

    await this.userRepository.save(user);

    res.redirect(await this.utilitiesService.getDiscordOauthUrl(user));
  }
}
