import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {Team} from "../team.schema";

@Injectable()
export class IsTeamCaptain implements CanActivate {
    constructor(@InjectModel(Team.name) private teamModel: Model<Team>) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user as any;
        const teamId = request.params.id;

        if (!Types.ObjectId.isValid(teamId)) {
            throw new ForbiddenException('Invalid tournament ID');
        }

        const team = await this.teamModel.findById(teamId);

        if (!team) {
            throw new ForbiddenException('Team not found');
        }

        if (team.captain.toString() !== user.id.toString()) {
            throw new ForbiddenException('You are not the creator of this team');
        }

        return true;
    }
}
