import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateReviewDto } from 'src/review/dto/create-review.dto';
import { disconnect, Types } from 'mongoose';
import { AuthDto } from 'src/auth/dto/auth.dto';

const productId = new Types.ObjectId().toHexString();
const loginDto: AuthDto = {
  login: 'a2@a.ru',
  password: '1',
};

const testDto: CreateReviewDto = {
  name: 'Test',
  title: 'Test Heading',
  description: 'Test Description',
  rating: 5,
  productId,
};

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let createdId: string;
  let token: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    const { body } = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto);
    token = body.access_token;
  });

  it('/review/create (POST) - success', (done) => {
    request(app.getHttpServer())
      .post('/review/create')
      .send(testDto)
      .expect(201)
      .expect(({ body }: request.Response) => {
        createdId = body._id;
        expect(createdId).toBeDefined();
      })
      .end(done);
  });

  it('/review/create (POST) - fail', (done) => {
    request(app.getHttpServer())
      .post('/review/create')
      .send({ ...testDto, rating: 0 })
      .expect(400)
      .expect(({ body }: request.Response) => {
        console.log(body);
      })
      .end(done);
  });

  it('/review/byProduct/:productId (GET) - success', (done) => {
    request(app.getHttpServer())
      .get('/review/byProduct/' + productId)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect(({ body }: request.Response) => {
        expect(body.length).toBe(1);
      })
      .end(done);
  });

  it('/review/byProduct/:productId (GET) - fail', (done) => {
    request(app.getHttpServer())
      .get('/review/byProduct/' + new Types.ObjectId().toHexString())
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect(({ body }: request.Response) => {
        expect(body.length).toBe(0);
      })
      .end(done);
  });

  it('/review/:id (DELETE) - success', (done) => {
    request(app.getHttpServer())
      .delete('/review/' + createdId)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .end(done);
  });

  it('/review/:id (DELETE) - fail', (done) => {
    request(app.getHttpServer())
      .delete('/review/' + new Types.ObjectId().toHexString())
      .set('Authorization', 'Bearer ' + token)
      .expect(404)
      .end(done);
  });

  afterAll(async () => {
    await disconnect();
  });
});
