import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateWholesaleInquiryDto } from './create-wholesale-inquiry.dto';

const validPayload = {
  companyName: 'Example Trading',
  contactName: 'Wholesale Buyer',
  contactEmail: 'buyer@example.com',
  deliveryCountry: 'PK',
  items: [
    {
      variantId: 'f0c7a6ab-e93f-4ce5-b9ce-843e229da9a9',
      requestedQuantity: 10,
    },
  ],
};

describe('CreateWholesaleInquiryDto', () => {
  it.each([
    '0300 1234567',
    '+92 300 1234567',
    '+92-300-1234567',
    '(0300) 1234567',
  ])('accepts common business phone format %s', async (contactPhone) => {
    const dto = plainToInstance(CreateWholesaleInquiryDto, {
      ...validPayload,
      contactPhone,
    });

    expect(await validate(dto)).toEqual([]);
  });

  it('normalizes customer text and the delivery country', async () => {
    const dto = plainToInstance(CreateWholesaleInquiryDto, {
      ...validPayload,
      companyName: '  Example Trading  ',
      deliveryCountry: ' pk ',
    });

    expect(await validate(dto)).toEqual([]);
    expect(dto.companyName).toBe('Example Trading');
    expect(dto.deliveryCountry).toBe('PK');
  });

  it('rejects text that is not a phone number', async () => {
    const dto = plainToInstance(CreateWholesaleInquiryDto, {
      ...validPayload,
      contactPhone: 'call me please',
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'contactPhone')).toBe(true);
  });
});
