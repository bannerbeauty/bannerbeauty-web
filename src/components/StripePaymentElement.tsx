'use client';

import { useEffect, useRef } from 'react';

const STRIPE_PK = 'pk_test_51TckbVJhCCth9fOizWlvrQWZZMWW9KmI0IGBWY1WYmOInCirpDw1yFdzxqb8HNJheCzqXGcK5UX3baTx6MxCXWS500lhMmYOCn';

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

    function init() {
      if (!active || !containerRef.current) return;
      // @ts-expect-error Stripe global
      const stripe = window.Stripe(STRIPE_PK) as StripeInstance;
      // @ts-expect-error Stripe global
      const elements = stripe.elements({ clientSecret, appearance: { theme: 'stripe' } });
      // @ts-expect-error Stripe elements
      const paymentElement = elements.create('payment', {
        layout: 'tabs',
        wallets: { applePay: 'never', googlePay: 'never' },
      });
      paymentElement.mount(containerRef.current);
      paymentElementRef.current = paymentElement;
      onInit?.(stripe, elements);
      onReady();
    }

    const existing = document.querySelector('script[src="https://js.stripe.com/v3/"]');
    if (existing) {
      // @ts-expect-error Stripe global
      if (window.Stripe) {
        init();
      } else {
        existing.addEventListener('load', init);
        return () => {
          active = false;
          existing.removeEventListener('load', init);
          paymentElementRef.current?.destroy();
          paymentElementRef.current = null;
        };
      }
    } else {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = init;
      document.head.appendChild(script);
    }

    return () => {
      active = false;
      paymentElementRef.current?.destroy();
      paymentElementRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientSecret]);

  return <div ref={containerRef} style={{ minHeight: 60 }} />;
}
