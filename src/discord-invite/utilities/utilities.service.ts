import { Inject, Injectable } from '@nestjs/common';
import { titleCase } from 'title-case';
import { User } from '../../entities/User';

@Injectable()
export class UtilitiesService {
  constructor(
    @Inject('DISCORD_THIS_DIVISION_ROLE')
    private discordThisDivisionRole: string,
    @Inject('DISCORD_OTHER_DIVISION_ROLE')
    private discordOtherDivisionRole: string,
    @Inject('DISCORD_THIS_DIVISION_STAFF_ROLE')
    private discordThisDivisionStaffRole: string,
    @Inject('DISCORD_OTHER_DIVISION_STAFF_ROLE')
    private discordOtherDivisionStaffRole: string,
    @Inject('DISCORD_HQ_STAFF_ROLE') private discordHQStaffRole: string,
    @Inject('DISCORD_VERIFIED_USER_ROLE')
    private discordVerifiedUserRole: string,
    @Inject('DISCORD_UNVERIFIED_USER_ROLE')
    private discordUnverifiedUserRole: string,
    @Inject('THIS_DIVISION') private thisDivision: string,
    @Inject('THIS_DIVISION_FIRS') private thisDivisionFirs: string[]
  ) {}

  calculateRoles(user: User | null): string[] {
    if (user) {
      const roles = new Set<string>();
      roles.add(this.discordVerifiedUserRole);
      if (user.division === this.thisDivision) {
        roles.add(this.discordThisDivisionRole);
      } else {
        roles.add(this.discordOtherDivisionRole);
      }
      if (user.staff) {
        const positions = user.staff.split(':').map((s) => s.trim());
        for (const position of positions) {
          if (position.includes('-')) {
            const firstPart = position.split('-')[0];
            if (
              firstPart === this.thisDivision ||
              this.thisDivisionFirs.includes(firstPart)
            ) {
              roles.add(this.discordThisDivisionStaffRole);
            } else {
              roles.add(this.discordOtherDivisionStaffRole);
            }
          } else {
            roles.add(this.discordHQStaffRole);
          }
        }
      }
      return Array.from<string>(roles);
    } else {
      return [this.discordUnverifiedUserRole];
    }
  }

  calculateNickname(user: User | null, discordUsername: string): string {
    if (user) {
      const eligiblePositions = user.staff
        ? user.staff
            .split(':')
            .map((s) => s.trim())
            .filter((s) => {
              return s.includes('-');
            })
            .filter((s) => {
              const firstPart = s.split('-')[0];
              return (
                firstPart === this.thisDivision ||
                this.thisDivisionFirs.includes(firstPart)
              );
            })
        : [];
      const prefix =
        eligiblePositions.length > 0
          ? `${eligiblePositions.join('/')} `
          : `${user.vid} `;

      const suffix =
        user.division === this.thisDivision ? '' : ` - ${user.division}`;

      const baseName = (user.customNickname
        ? user.customNickname
        : `${titleCase(user.firstname)}`
      ).substr(0, 32 - prefix.length - suffix.length);
      return prefix + baseName + suffix;
    } else {
      return `[UNVERIFIED] ${discordUsername}`.substr(0, 32);
    }
  }
}
