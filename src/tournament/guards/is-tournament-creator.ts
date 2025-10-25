import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tournament } from '../tournament.schema';
import {ROLES} from "../../auth/roles";

@Injectable()
export class IsTournamentCreatorGuard implements CanActivate {
    constructor(@InjectModel(Tournament.name) private tournamentModel: Model<Tournament>) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user as any; // JwtAuthGuard aggiunge user
        const tournamentId = request.params.id;

        if (!Types.ObjectId.isValid(tournamentId)) {
            throw new ForbiddenException('Invalid tournament ID');
        }

        const tournament = await this.tournamentModel.findById(tournamentId);

        if (!tournament) {
            throw new ForbiddenException('Tournament not found');
        }

        if (user.type_user === ROLES.DEFAULT && tournament.createdBy.toString() !== user.id.toString()) {
            throw new ForbiddenException('You are not the creator of this tournament');
        }

        return true;
    }
}
