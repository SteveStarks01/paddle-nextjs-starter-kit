import { Users, GraduationCap, DollarSign, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const overviewData = [
  {
    title: 'Total Students',
    icon: <Users className={'text-[#4B4F4F]'} size={18} />,
    value: '1,247',
    change: '+12% from last month',
  },
  {
    title: 'Active Enrollments',
    icon: <GraduationCap className={'text-[#4B4F4F]'} size={18} />,
    value: '1,189',
    change: '+8% from last month',
  },
  {
    title: 'Total Revenue',
    icon: <DollarSign className={'text-[#4B4F4F]'} size={18} />,
    value: '$2.4M',
    change: '+15% from last month',
  },
  {
    title: 'Pending Payments',
    icon: <AlertCircle className={'text-[#4B4F4F]'} size={18} />,
    value: '89',
    change: '-5% from last month',
  },
];

export function SchoolAdminOverviewCards() {
  return (
    <div className={'grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2'}>
      {overviewData.map((card) => (
        <Card key={card.title} className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
          <CardHeader className="p-0 space-y-0">
            <CardTitle className="flex justify-between items-center mb-6">
              <span className={'text-base leading-4'}>{card.title}</span> {card.icon}
            </CardTitle>
            <CardDescription className={'text-[32px] leading-[32px] text-primary'}>{card.value}</CardDescription>
          </CardHeader>
          <CardContent className={'p-0'}>
            <div className="text-sm leading-[14px] pt-2 text-secondary">{card.change}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}