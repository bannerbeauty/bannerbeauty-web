'use client';

import { useEffect, useRef } from 'react';

const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

interface StripeInstance {
  confirmPayment: (opts: unknown) => Promise<{ error?: { message: string } }>;
}

interface Props {
  clientSecret: string;
  onReady: () => void;
  onInit?: (stripe: StripeInstance, elements: unknown) => void;
}

export default function StripePaymentElement({ clientSecret, onReady, onInit }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const paymentElementRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    if (!clientSecret || !containerRef.current) return;

    let active = true;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    function init() {
      if (!active || !containerRef.current) return;
      // @ts-expect-error Stripe global
      const stripe = window.Stripe(STRIPE_PK) as StripeInstance;
      // @ts-expect-error Stripe global
      const elements = stripe.elements({ clientSecret, appearance: { theme: 'stripe' } });
      const paymentElement = elements.create('payment', {
        layout: 'tabs',
        wallets: { applePay: 'never', googlePay: 'never' },
      });
      paymentElement.mount(containerRef.current);
      paymentElementRef.current = paymentElement;
      onInit?.(stripe, elements);
      onReady();
    }

    function waitForStripe() {
      // @ts-expect-error Stripe global
      if (window.Stripe) {
        if (pollInterval) clearInterval(pollInterval);
        init();
        return;
      }
      pollInterval = setInterval(() => {
        // @ts-expect-error Stripe global
        if (window.Stripe) {
          clearInterval(pollInterval!);
          pollInterval = null;
          if (active) init();
        }
      }, 100);
    }

    const existing = document.querySelector('script[src="https://js.stripe.com/v3/"]');
    if (existing) {
      waitForStripe();
    } else {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = waitForStripe;
      document.head.appendChild(script);
    }

    return () => {
      active = false;
      if (pollInterval) clearInterval(pollInterval);
      paymentElementRef.current?.destroy();
      paymentElementRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientSecret]);

  return <div ref={containerRef} style={{ minHeight: 60 }} />;
}
