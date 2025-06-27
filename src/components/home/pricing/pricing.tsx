'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Smartphone, CreditCard } from 'lucide-react';
import Link from 'next/link';

const pricingPlans = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 99,
    currency: 'USD',
    period: 'month',
    description: 'Perfect for small schools',
    features: [
      'Up to 500 students',
      'Basic reporting',
      'Email support',
      'Mobile money payments',
      '5 departments max',
    ],
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    price: 199,
    currency: 'USD',
    period: 'month',
    description: 'Ideal for growing institutions',
    features: [
      'Up to 2,000 students',
      'Advanced reporting',
      'Priority support',
      'Custom branding',
      'API access',
      '15 departments max',
      'Bulk student management',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 499,
    currency: 'USD',
    period: 'month',
    description: 'For large educational institutions',
    features: [
      'Unlimited students',
      'Unlimited departments',
      '24/7 support',
      'Custom integrations',
      'Dedicated account manager',
      'Advanced analytics',
      'Multi-school management',
    ],
    popular: false,
  },
];

export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');

  const formatPrice = (price: number, currency: string, period: string) => {
    const yearlyPrice = billingPeriod === 'year' ? price * 10 : price; // 2 months free
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(yearlyPrice);
  };

  return (
    <div className="mx-auto max-w-7xl relative px-[32px] flex flex-col items-center justify-between">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center mb-8">
        <div className="bg-background border border-border rounded-lg p-1">
          <button
            onClick={() => setBillingPeriod('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingPeriod === 'month'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('year')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingPeriod === 'year'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yearly
            <span className="ml-1 text-xs bg-green-500 text-white px-1 rounded">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 w-full">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative overflow-hidden ${
              plan.popular
                ? 'border-primary shadow-lg scale-105'
                : 'border-border'
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                Most Popular
              </div>
            )}
            
            <CardHeader className={plan.popular ? 'pt-12' : ''}>
              <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {formatPrice(plan.price, plan.currency, plan.period)}
                </span>
                <span className="text-muted-foreground">
                  /{billingPeriod}
                </span>
              </div>
              <p className="text-muted-foreground">{plan.description}</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-3">
                <Button asChild className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                  <Link href="/signup">Get Started</Link>
                </Button>
                
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Smartphone className="h-3 w-3" />
                  <span>MTN & Orange Money supported</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Methods */}
      <div className="mt-16 text-center">
        <h3 className="text-lg font-semibold mb-4">Supported Payment Methods</h3>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div className="flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-yellow-500" />
            <span className="font-medium">MTN Mobile Money</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-orange-500" />
            <span className="font-medium">Orange Money</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-blue-500" />
            <span className="font-medium">Bank Transfer</span>
          </div>
        </div>
      </div>
    </div>
  );
}