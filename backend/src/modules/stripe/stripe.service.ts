import {
  Injectable,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SafeLogger } from '../../common/utils/logger.util';

@Injectable()
export class StripeService {
  private stripe: Stripe | null;
  private currency: string;

  constructor(private config: ConfigService) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY', '').trim();
    this.stripe = key && !key.includes('your_')
      ? new Stripe(key, { apiVersion: '2026-02-25.clover' })
      : null;
    this.currency = this.config.get<string>('STRIPE_CURRENCY') || 'pkr';
  }

  isConfigured(): boolean {
    return this.stripe !== null;
  }

  private client(): Stripe {
    if (!this.stripe) {
      throw new ServiceUnavailableException(
        'Online payments are not configured. Add Stripe credentials to .env.',
      );
    }
    return this.stripe;
  }

  /**
   * Create a Stripe Checkout Session for a one-time payment.
   */
  async createCheckoutSession(params: {
    orderId: string;
    amount: number;
    customerEmail: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Checkout.Session> {
    return this.client().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: params.customerEmail,
      line_items: [
        {
          price_data: {
            currency: this.currency,
            product_data: { name: `Order #${params.orderId}` },
            unit_amount: Math.round(params.amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { orderId: params.orderId, ...params.metadata },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });
  }

  /**
   * Create a Stripe Checkout Session for a subscription.
   */
  async createSubscriptionSession(params: {
    priceId: string;
    customerEmail: string;
    userId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<Stripe.Checkout.Session> {
    return this.client().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: params.customerEmail,
      line_items: [{ price: params.priceId, quantity: 1 }],
      metadata: { userId: params.userId },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });
  }

  /**
   * Cancel a Stripe subscription.
   */
  async cancelSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription> {
    return this.client().subscriptions.cancel(subscriptionId);
  }

  /**
   * Retrieve a Stripe Checkout Session.
   */
  async retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return this.client().checkout.sessions.retrieve(sessionId);
  }

  /**
   * Construct and verify a webhook event from the raw body + signature.
   */
  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    try {
      const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET', '');
      if (!secret || secret.includes('your_')) {
        throw new ServiceUnavailableException(
          'Stripe webhook secret is not configured',
        );
      }
      return this.client().webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      if (err instanceof ServiceUnavailableException) throw err;
      SafeLogger.error(
        `Stripe webhook signature verification failed: ${err.message}`,
        'StripeService',
      );
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  /**
   * Get all configured subscription price IDs.
   */
  getPriceIds(): Record<string, string> {
    return {
      basic_monthly: this.config.get<string>('STRIPE_PRICE_BASIC_MONTHLY'),
      basic_annual: this.config.get<string>('STRIPE_PRICE_BASIC_ANNUAL'),
      professional_monthly: this.config.get<string>(
        'STRIPE_PRICE_PROFESSIONAL_MONTHLY',
      ),
      professional_annual: this.config.get<string>(
        'STRIPE_PRICE_PROFESSIONAL_ANNUAL',
      ),
      premium_monthly: this.config.get<string>('STRIPE_PRICE_PREMIUM_MONTHLY'),
      premium_annual: this.config.get<string>('STRIPE_PRICE_PREMIUM_ANNUAL'),
    };
  }

  /**
   * Create a refund for a payment intent.
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number,
  ): Promise<Stripe.Refund> {
    const params: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };
    if (amount) params.amount = Math.round(amount * 100);
    return this.client().refunds.create(params);
  }
}
