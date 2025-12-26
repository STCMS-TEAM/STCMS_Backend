// blog/guards/owner.guard.ts
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { BlogService } from '../blog.service';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private readonly blogService: BlogService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const blogId = request.params.blogId;
    const userId = request.user._id; // dall’auth JWT

    const blog = await this.blogService.findById(blogId);
    if (!blog) {
      return false;
    }

    if (blog.createdBy.toString() !== userId) {
      throw new ForbiddenException('Non sei autorizzato a modificare/eliminare questo post');
    }

    return true;
  }
}
