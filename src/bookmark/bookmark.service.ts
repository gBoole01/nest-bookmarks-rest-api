import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({ where: { userId } });
  }

  async getBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: { id: bookmarkId, userId },
    });

    if (!bookmark) throw new NotFoundException('Bookmark does not exist');

    return bookmark;
  }

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    return this.prisma.bookmark.create({ data: { ...dto, userId } });
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: { id: bookmarkId, userId },
    });

    if (!bookmark) throw new NotFoundException('Bookmark does not exist');

    if (bookmark.userId !== userId)
      throw new ForbiddenException('Access denied');

    return this.prisma.bookmark.update({
      where: { id: bookmarkId },
      data: { ...dto },
    });
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: { id: bookmarkId, userId },
    });

    if (!bookmark) throw new NotFoundException('Bookmark does not exist');

    if (bookmark.userId !== userId)
      throw new ForbiddenException('Access denied');

    return this.prisma.bookmark.delete({ where: { id: bookmarkId } });
  }
}
