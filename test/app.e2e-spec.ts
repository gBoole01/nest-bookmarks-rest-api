import * as pactum from 'pactum';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from 'src/auth/dto';

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
    await app.listen(3001);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3001');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test@test.test',
      password: 'test',
    };
    describe('Signup', () => {
      it('should return 400 on missing body', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });

      it('should return 400 on missing email', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...dto, email: undefined })
          .expectStatus(400);
      });

      it('should return 400 on invalid email', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...dto, email: 'test' })
          .expectStatus(400);
      });

      it('should return 400 on empty email', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...dto, email: '' })
          .expectStatus(400);
      });

      it('should return 400 on missing password', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...dto, password: undefined })
          .expectStatus(400);
      });

      it('should return 400 on empty password', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...dto, password: '' })
          .expectStatus(400);
      });

      it('should register a user and return a token', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe('Signin', () => {
      it('should return 400 on missing body', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });

      it('should return 400 on missing email', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...dto, email: undefined })
          .expectStatus(400);
      });

      it('should return 400 on invalid email', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...dto, email: 'test' })
          .expectStatus(400);
      });

      it('should return 400 on empty email', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...dto, email: '' })
          .expectStatus(400);
      });

      it('should return 400 on missing password', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...dto, password: undefined })
          .expectStatus(400);
      });

      it('should return 400 on empty password', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...dto, password: '' })
          .expectStatus(400);
      });

      it('should authenticate a user and return a token', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should return currently logged in user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200);
      });
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

    describe('Edit bookmark by id', () => {
      it.todo('should update a bookmark');
    });

    describe('Delete bookmark by id', () => {
      it.todo('should delete a bookmark');
    });
  });
});
