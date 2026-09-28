import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Auditable } from '../../common/interceptor/audit.interceptor';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { StorageService } from '../../common/services/storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleEnum } from '../roles/role.enum';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { SellersService } from './sellers.service';

@ApiTags('Store')
@Controller('stores')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class StoresController {
  constructor(
    private readonly svc: SellersService,
    private readonly storage: StorageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Configure the single store (Admin only)' })
  @ApiResponse({ status: 409, description: 'The store is already configured' })
  @Auditable({ action: 'CREATE', tableName: 'stores' })
  create(@Body() dto: CreateStoreDto) {
    return this.svc.createStore(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get the store as a backward-compatible list' })
  findAll() {
    return this.svc.findAllStores();
  }

  @Get('current')
  @Public()
  @ApiOperation({ summary: 'Get the store' })
  findCurrent() {
    return this.svc.findCurrentStore();
  }

  @Get('slug/:slug')
  @Public()
  findBySlug(@Param('slug') slug: string) {
    return this.svc.findStoreBySlug(slug);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.svc.findStore(id);
  }

  @Put('current')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Auditable({ action: 'UPDATE', tableName: 'stores' })
  updateCurrent(@Body() dto: UpdateStoreDto) {
    return this.svc.updateCurrentStore(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Auditable({ action: 'UPDATE', tableName: 'stores' })
  update(@Param('id') id: string, @Body() dto: UpdateStoreDto) {
    return this.svc.updateStore(id, dto);
  }

  @Patch(':id/logo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'Store UUID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadLogo(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Req() _req: any) {
    const logoUrl = await this.storage.upload(file, 'stores');
    return this.svc.updateStore(id, { logoUrl });
  }

  @Patch(':id/banner')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadBanner(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    const bannerUrl = await this.storage.upload(file, 'stores');
    return this.svc.updateStore(id, { bannerUrl });
  }
}
