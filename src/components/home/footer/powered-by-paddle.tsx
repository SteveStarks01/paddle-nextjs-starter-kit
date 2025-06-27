import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { ArrowUpRight, Smartphone } from 'lucide-react';

export function PoweredByPlatform() {
  return (
    <>
      <Separator className={'footer-border'} />
      <div
        className={
          'flex flex-col justify-center items-center gap-2 text-muted-foreground text-sm leading-[14px] py-[24px]'
        }
      >
        <div className={'flex justify-center items-center gap-2'}>
          <Smartphone className="h-4 w-4" />
          <span className={'text-sm leading-[14px]'}>Powered by Mobile Money Technology</span>
        </div>
        <div className={'flex justify-center items-center gap-2 flex-wrap md:flex-nowrap'}>
          <Link className={'text-sm leading-[14px]'} href={'https://developer.mtn.com'} target={'_blank'}>
            <span className={'flex items-center gap-1'}>
              MTN Developer Portal
              <ArrowUpRight className={'h-4 w-4'} />
            </span>
          </Link>
          <Link className={'text-sm leading-[14px]'} href={'https://developer.orange.com'} target={'_blank'}>
            <span className={'flex items-center gap-1'}>
              Orange Developer
              <ArrowUpRight className={'h-4 w-4'} />
            </span>
          </Link>
          <Link className={'text-sm leading-[14px]'} href={'/privacy'} target={'_blank'}>
            <span className={'flex items-center gap-1'}>
              Privacy Policy
              <ArrowUpRight className={'h-4 w-4'} />
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}