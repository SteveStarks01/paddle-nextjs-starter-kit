import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Building } from 'lucide-react';

const enrollments = [
  {
    id: '1',
    school: 'Tech University',
    department: 'Computer Science',
    specialty: 'Software Engineering',
    academicYear: '2024-2025',
    status: 'active',
    feeStatus: 'partial',
    totalFee: 8500,
    paidAmount: 5500,
  },
  {
    id: '2',
    school: 'Business College',
    department: 'Business Administration',
    specialty: 'Digital Marketing',
    academicYear: '2024-2025',
    status: 'active',
    feeStatus: 'paid',
    totalFee: 4000,
    paidAmount: 4000,
  },
];

export function StudentPortalEnrollments() {
  return (
    <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
      <CardHeader className="p-0 space-y-0">
        <CardTitle className="flex justify-between items-center pb-6 border-border border-b">
          <span className={'text-xl font-medium'}>My Enrollments</span>
          <Button asChild={true} size={'sm'} variant={'outline'} className={'text-sm rounded-sm border-border'}>
            <Link href={'/student-portal/enrollment'}>View all</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className={'p-0 pt-6'}>
        <div className={'flex flex-col gap-6'}>
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className={'border border-border rounded-lg p-4'}>
              <div className={'flex justify-between items-start mb-4'}>
                <div className={'flex items-center gap-3'}>
                  <div className={'p-2 bg-primary/10 rounded-lg'}>
                    <GraduationCap className={'h-5 w-5 text-primary'} />
                  </div>
                  <div>
                    <h3 className={'font-semibold text-lg'}>{enrollment.school}</h3>
                    <p className={'text-sm text-muted-foreground'}>{enrollment.academicYear}</p>
                  </div>
                </div>
                <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'}>
                  {enrollment.status}
                </Badge>
              </div>
              
              <div className={'flex items-center gap-2 mb-3'}>
                <Building className={'h-4 w-4 text-muted-foreground'} />
                <span className={'text-sm text-muted-foreground'}>
                  {enrollment.department} - {enrollment.specialty}
                </span>
              </div>

              <div className={'flex justify-between items-center'}>
                <div className={'flex flex-col gap-1'}>
                  <span className={'text-sm text-muted-foreground'}>Fee Status</span>
                  <div className={'flex items-center gap-2'}>
                    <span className={'font-semibold'}>
                      ${enrollment.paidAmount.toLocaleString()} / ${enrollment.totalFee.toLocaleString()}
                    </span>
                    <Badge variant={enrollment.feeStatus === 'paid' ? 'default' : 'secondary'}>
                      {enrollment.feeStatus === 'paid' ? 'Paid' : 'Partial'}
                    </Badge>
                  </div>
                </div>
                <Button size={'sm'} variant={'outline'}>
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}