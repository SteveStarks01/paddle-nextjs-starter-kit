import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PoweredByPlatform } from '@/components/home/footer/powered-by-paddle';
import '../../../styles/checkout.css';
import { createClient } from '@/utils/supabase/server';
import { CheckCircle, Smartphone } from 'lucide-react';

export default async function SuccessPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <main>
      <div className={'relative h-screen overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-green-700'}>
        <div className={'absolute inset-0 px-6 flex items-center justify-center'}>
          <div className={'flex flex-col items-center text-white text-center max-w-md'}>
            <div className="bg-green-500 rounded-full p-6 mb-8">
              <CheckCircle className="h-16 w-16 text-white" />
            </div>
            <h1 className={'text-4xl md:text-6xl leading-tight font-medium pb-6'}>
              Payment Successful
            </h1>
            <p className={'text-lg pb-8 opacity-90'}>
              Your mobile money payment has been processed successfully. You now have access to the platform.
            </p>
            <div className="flex items-center gap-2 mb-8 text-green-200">
              <Smartphone className="h-5 w-5" />
              <span className="text-sm">Processed via Mobile Money</span>
            </div>
            <Button variant={'secondary'} asChild={true} size="lg">
              {data.user ? <Link href={'/dashboard'}>Go to Dashboard</Link> : <Link href={'/'}>Go to Home</Link>}
            </Button>
          </div>
        </div>
        <div className={'absolute bottom-0 w-full'}>
          <PoweredByPlatform />
        </div>
      </div>
    </main>
  );
}