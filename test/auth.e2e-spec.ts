import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { disconnect } from 'mongoose';
import { AuthDto } from 'src/auth/dto/auth.dto';

const loginDto: AuthDto = {
  login: 'a2@a.ru',
  password: '1',
};

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/login (POST) - success', (done) => {
    request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(200)
      .expect(({ body }: request.Response) => {
        expect(body.access_token).toBeDefined();
      })
      .end(done);
  });

  it('/auth/login (POST) - password fail', (done) => {
    request(app.getHttpServer())
      .post('/auth/login')
      .send({ ...loginDto, password: '12' })
      .expect(401, {
        message: 'Password is an invalid.',
        error: 'Unauthorized',
        statusCode: 401,
      })
      .end(done);
  });

  it('/auth/login (POST) - login fail', (done) => {
    request(app.getHttpServer())
      .post('/auth/login')
      .send({ ...loginDto, login: 'aa@a.ru' })
      .expect(401, {
        message: 'This user is not found.',
        error: 'Unauthorized',
        statusCode: 401,
      })
      .end(done);
  });

  afterAll(async () => {
    await disconnect();
  });
});
