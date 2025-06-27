import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const recentEnrollments = [
  {
    id: '1',
    studentName: 'John Doe',
    studentId: 'STU001',
    department: 'Computer Science',
    specialty: 'Software Engineering',
    enrollmentDate: '2024-01-15',
    status: 'active',
    feeStatus: 'paid',
  },
  {
    id: '2',
    studentName: 'Jane Smith',
    studentId: 'STU002',
    department: 'Business',
    specialty: 'Marketing',
    enrollmentDate: '2024-01-14',
    status: 'active',
    feeStatus: 'pending',
  },
  {
    id: '3',
    studentName: 'Mike Johnson',
    studentId: 'STU003',
    department: 'Engineering',
    specialty: 'Civil Engineering',
    enrollmentDate: '2024-01-13',
    status: 'active',
    feeStatus: 'overdue',
  },
];

export function SchoolAdminRecentEnrollments() {
  return (
    <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
      <CardHeader className="p-0 space-y-0">
        <CardTitle className="flex justify-between items-center pb-6 border-border border-b">
          <span className={'text-xl font-medium'}>Recent Enrollments</span>
          <Button asChild={true} size={'sm'} variant={'outline'} className={'text-sm rounded-sm border-border'}>
            <Link href={'/school-admin/students'}>View all</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className={'p-0 pt-6'}>
        <div className={'flex flex-col gap-4'}>
          {recentEnrollments.map((enrollment) => (
            <div key={enrollment.id} className={'flex flex-col gap-3 border-border border-b pb-4 last:border-b-0'}>
              <div className={'flex justify-between items-start'}>
                <div className={'flex flex-col gap-1'}>
                  <span className={'font-semibold text-base leading-4'}>{enrollment.studentName}</span>
                  <span className={'text-sm text-secondary'}>{enrollment.studentId}</span>
                </div>
                <div className={'flex gap-2'}>
                  <Badge variant={enrollment.feeStatus === 'paid' ? 'default' : enrollment.feeStatus === 'pending' ? 'secondary' : 'destructive'}>
                    {enrollment.feeStatus}
                  </Badge>
                </div>
              </div>
              <div className={'text-sm text-secondary'}>
                {enrollment.department} - {enrollment.specialty}
              </div>
              <div className={'text-xs text-muted-foreground'}>
                Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}