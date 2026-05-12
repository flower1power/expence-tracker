import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import {
  CreateCategoryCommand,
  UpdateCategoryCommand,
  DeleteCategoryCommand,
} from './commands';
import { GetAllCategoriesQuery } from './queries';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Создать категорию' })
  @ApiResponse({ status: 201, description: 'Категория создана', type: CategoryResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Post()
  create(@Body() dto: CreateCategoryDto, @CurrentUser() user: User) {
    return this.commandBus.execute(
      new CreateCategoryCommand(dto.name, dto.color, dto.icon, user.id),
    );
  }

  @ApiOperation({ summary: 'Получить все категории пользователя' })
  @ApiResponse({ status: 200, description: 'Список категорий', type: [CategoryResponseDto] })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Get()
  findAll(@CurrentUser() user: User) {
    return this.queryBus.execute(new GetAllCategoriesQuery(user.id));
  }

  @ApiOperation({ summary: 'Обновить категорию' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Категория обновлена', type: CategoryResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещён' })
  @ApiResponse({ status: 404, description: 'Категория не найдена' })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: User,
  ) {
    return this.commandBus.execute(
      new UpdateCategoryCommand(id, user.id, dto),
    );
  }

  @ApiOperation({ summary: 'Удалить категорию' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Категория удалена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещён' })
  @ApiResponse({ status: 404, description: 'Категория не найдена' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.commandBus.execute(new DeleteCategoryCommand(id, user.id));
  }
}
