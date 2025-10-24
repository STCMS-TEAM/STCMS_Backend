import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from "@nestjs/common";
import {ROLES}                                                         from "./roles";

@Injectable()
export class ClientGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const { user, params } = request;

        if (user.type_user === ROLES.DEFAULT && params.id !== user.id) {
            throw new ForbiddenException('Non hai accesso a questa risorsa!');
        }

        return true;
    }
}
