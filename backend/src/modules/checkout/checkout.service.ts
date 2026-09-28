import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CartService } from '../cart/cart.service';
import { OrdersService } from '../orders/orders.service';
import { StripeService } from '../stripe/stripe.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly carts: CartService,
    private readonly orders: OrdersService,
    private readonly stripe: StripeService,
    private readonly dataSource: DataSource,
  ) {}

  async checkout(user: { id: string; email: string }, dto: CreateCheckoutDto) {
    const existing = await this.dataSource.query(
      `SELECT * FROM orders WHERE user_id = $1 AND idempotency_key = $2`,
      [user.id, dto.idempotencyKey],
    );
    const existingRows = Array.isArray(existing?.[0]) ? existing[0] : existing;
    if (existingRows?.length) return { order: existingRows[0], reused: true };

    if (dto.paymentMethod === 'stripe' && !this.stripe.isConfigured()) {
      // Fails before inventory or order data is mutated.
      throw new BadRequestException(
        'Stripe is not configured. Use cash_on_delivery or add credentials.',
      );
    }
    const items = await this.carts.getCartItems(user.id);
    if (!items.length) throw new BadRequestException('Cart is empty');
    const order = await this.orders.create(
      {
        userId: user.id,
        idempotencyKey: dto.idempotencyKey,
        shippingLine1: dto.shippingLine1,
        shippingCity: dto.shippingCity,
        shippingState: dto.shippingState,
        shippingPostalCode: dto.shippingPostalCode,
        shippingCountry: dto.shippingCountry.toUpperCase(),
        status: dto.paymentMethod === 'stripe' ? 'pending_payment' : 'pending',
      },
      items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
    );

    let payment: { sessionId: string; url: string | null } | null = null;
    if (dto.paymentMethod === 'stripe') {
      if (!dto.successUrl || !dto.cancelUrl) {
        throw new BadRequestException('Stripe checkout requires successUrl and cancelUrl');
      }
      const session = await this.stripe.createCheckoutSession({
        orderId: order.id, amount: Number(order.totalAmount), customerEmail: user.email,
        successUrl: dto.successUrl, cancelUrl: dto.cancelUrl, metadata: { userId: user.id },
      });
      payment = { sessionId: session.id, url: session.url };
    }
    await this.carts.clearCart(user.id);
    return { order, payment, reused: false };
  }
}
