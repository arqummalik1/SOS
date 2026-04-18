import { apiClient } from '../api/client';
import { API_CONFIG } from '../api/config';
import { API_ENDPOINTS } from '../api/endpoints';

type UpiVerifyInput = {
  upiId: string;
};

type UpiPayInput = {
  upiId: string;
  amount: number;
  currency?: string;
};

type CardChargeInput = {
  cardNumber: string;
  expiry: string;
  cvv: string;
  nameOnCard: string;
  amount: number;
  currency?: string;
};

type NetBankingChargeInput = {
  bank: string;
  amount: number;
  currency?: string;
};

type PaypalChargeInput = {
  paypalId: string;
  amount: number;
  currency?: string;
};

export type PaymentResult = {
  success: boolean;
  paymentId?: string;
  status?: string;
};

const shouldUseMock = (): boolean => API_CONFIG.isUsingFallbackBaseUrl;

const toPaymentResult = (response: unknown): PaymentResult => {
  if (!response || typeof response !== 'object') {
    return { success: true };
  }

  const payload = response as Record<string, unknown>;
  return {
    success: payload.success === undefined ? true : Boolean(payload.success),
    paymentId: typeof payload.paymentId === 'string' ? payload.paymentId : undefined,
    status: typeof payload.status === 'string' ? payload.status : undefined,
  };
};

export const paymentService = {
  async verifyUpi(payload: UpiVerifyInput): Promise<PaymentResult> {
    if (shouldUseMock()) {
      return { success: /^[\w.+-]{2,}@[a-zA-Z]{2,}$/i.test(payload.upiId.trim()) };
    }

    const response = await apiClient.post(API_ENDPOINTS.payment.upiVerify, payload);
    return toPaymentResult(response);
  },

  async payWithUpi(payload: UpiPayInput): Promise<PaymentResult> {
    if (shouldUseMock()) {
      return { success: true, status: 'pending' };
    }

    const response = await apiClient.post(API_ENDPOINTS.payment.upiPay, payload);
    return toPaymentResult(response);
  },

  async payWithCard(payload: CardChargeInput): Promise<PaymentResult> {
    if (shouldUseMock()) {
      return { success: true, status: 'authorized' };
    }

    const response = await apiClient.post(API_ENDPOINTS.payment.cardCharge, payload);
    return toPaymentResult(response);
  },

  async payWithNetBanking(payload: NetBankingChargeInput): Promise<PaymentResult> {
    if (shouldUseMock()) {
      return { success: true, status: 'pending' };
    }

    const response = await apiClient.post(API_ENDPOINTS.payment.netBankingCharge, payload);
    return toPaymentResult(response);
  },

  async payWithPaypal(payload: PaypalChargeInput): Promise<PaymentResult> {
    if (shouldUseMock()) {
      return { success: true, status: 'authorized' };
    }

    const response = await apiClient.post(API_ENDPOINTS.payment.paypalCharge, payload);
    return toPaymentResult(response);
  },
};
