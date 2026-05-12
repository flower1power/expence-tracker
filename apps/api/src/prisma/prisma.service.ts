import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/** Сервис для работы с Prisma ORM; управляет жизненным циклом соединения с БД. */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /** Открывает соединение с БД при инициализации модуля. */
  async onModuleInit() {
    await this.$connect();
  }

  /** Закрывает соединение с БД при завершении работы модуля. */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
