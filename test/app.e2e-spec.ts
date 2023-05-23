import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    describe('Signup', () => {
      it.todo('should register a user and return a token');
    });
    describe('Signin', () => {
      it.todo('should authenticate a user and return a token');
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it.todo('should return currently logged in user');
    });

    describe('Edit user', () => {
      it.todo('should update currently logged in user');
    });
  });

  describe('Bookmarks', () => {
    describe('Create bookmark', () => {
      it.todo('should create a bookmark');
    });

    describe('Get all bookmarks', () => {
      it.todo('should return all bookmarks');
    });

    describe('Get bookmark by id', () => {
      it.todo('should return a bookmark by id');
    });

    describe('Edit bookmark', () => {
      it.todo('should update a bookmark');
    });

    describe('Delete bookmark', () => {
      it.todo('should delete a bookmark');
    });
  });
});
