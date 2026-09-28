import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleEnum } from '../roles/role.enum';
import {
  CreateWholesaleInquiryDto,
  CreateWholesaleQuotationDto,
  ListWholesaleInquiriesDto,
  UpdateWholesaleInquiryDto,
} from './dto';
import { QuotationStatus } from './enums/wholesale.enum';
import { WholesaleService } from './wholesale.service';

@ApiTags('Wholesale')
@ApiBearerAuth('JWT-auth')
@Controller('wholesale')
export class WholesaleController {
  constructor(private readonly wholesaleService: WholesaleService) {}

  @Post('inquiries')
  @ApiOperation({ summary: 'Submit a wholesale request for quotation' })
  createInquiry(
    @CurrentUser() user: any,
    @Body() dto: CreateWholesaleInquiryDto,
  ) {
    return this.wholesaleService.createInquiry(user.id, dto);
  }

  @Get('inquiries')
  @ApiOperation({
    summary: 'List own inquiries; admins can list all inquiries',
  })
  listInquiries(
    @CurrentUser() user: any,
    @Query() query: ListWholesaleInquiriesDto,
  ) {
    return this.wholesaleService.listInquiries(user, query);
  }

  @Get('inquiries/:id')
  @ApiOperation({
    summary: 'Get an inquiry, its items, variant colors, and quotations',
  })
  getInquiry(@Param('id') id: string, @CurrentUser() user: any) {
    return this.wholesaleService.getInquiry(id, user);
  }

  @Patch('inquiries/:id/cancel')
  @ApiOperation({ summary: 'Cancel an unquoted inquiry owned by the customer' })
  cancelInquiry(@Param('id') id: string, @CurrentUser() user: any) {
    return this.wholesaleService.cancelInquiry(id, user.id);
  }

  @Patch('inquiries/:id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update inquiry status or internal admin notes' })
  updateInquiry(
    @Param('id') id: string,
    @Body() dto: UpdateWholesaleInquiryDto,
  ) {
    return this.wholesaleService.updateInquiry(id, dto);
  }

  @Post('inquiries/:id/quotations')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create and send a wholesale quotation' })
  createQuotation(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: CreateWholesaleQuotationDto,
  ) {
    return this.wholesaleService.createQuotation(id, user.id, dto);
  }

  @Patch('quotations/:id/accept')
  @ApiOperation({ summary: 'Accept an active quotation owned by the customer' })
  acceptQuotation(@Param('id') id: string, @CurrentUser() user: any) {
    return this.wholesaleService.respondToQuotation(
      id,
      user.id,
      QuotationStatus.ACCEPTED,
    );
  }

  @Patch('quotations/:id/decline')
  @ApiOperation({
    summary: 'Decline an active quotation owned by the customer',
  })
  declineQuotation(@Param('id') id: string, @CurrentUser() user: any) {
    return this.wholesaleService.respondToQuotation(
      id,
      user.id,
      QuotationStatus.DECLINED,
    );
  }
}
