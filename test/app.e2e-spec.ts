import * as pactum from 'pactum';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';

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
      it('should return 401 on missing token', () => {
        return pactum.spec().get('/users/me').expectStatus(401);
      });

      it('should return currently logged in user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {
      const dto: EditUserDto = {
        firstName: 'test',
        lastName: 'test',
      };
      it('should return 401 on missing token', () => {
        return pactum.spec().patch('/users').expectStatus(401);
      });

      it('should return 400 on invalid email', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .withBody({ ...dto, email: 'test' })
          .expectStatus(400);
      });

      it('should update currently logged in user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.lastName);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Create bookmark', () => {
      it('should return 401 on missing token', () => {
        return pactum.spec().post('/bookmarks').expectStatus(401);
      });

      it('should return 400 on missing body', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(400);
      });

      it('should create a bookmark', () => {
        const dto = {
          title: 'test',
          description: 'test',
          link: 'https://test.test',
        };

        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description)
          .expectBodyContains(dto.link);
      });
    });

    describe('Get all bookmarks', () => {
      it('should return 401 on missing token', () => {
        return pactum.spec().get('/bookmarks').expectStatus(401);
      });

      it('should return all bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200);
      });
    });

    describe('Get bookmark by id', () => {
      it('should return 401 on missing token', () => {
        return pactum.spec().get('/bookmarks/1').expectStatus(401);
      });

      it('should return 404 on missing bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks/999')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(404);
      });

      it('should return a bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/1')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200);
      });
    });

    describe('Edit bookmark by id', () => {
      it('should return 401 on missing token', () => {
        return pactum.spec().patch('/bookmarks/1').expectStatus(401);
      });

      it('should return 404 on missing bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/999')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(404);
      });

      it('should update a bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/1')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200);
      });
    });

    describe('Delete bookmark by id', () => {
      it('should return 401 on missing token', () => {
        return pactum.spec().delete('/bookmarks/1').expectStatus(401);
      });

      it('should return 404 on missing bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/999')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(404);
      });

      it('should delete a bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/1')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200);
      });
    });
  });
});
