'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Eye, CreditCard } from 'lucide-react';
import { getMyEnrollments } from '@/utils/school-fee/get-enrollments';
import { StudentEnrollment } from '@/lib/school-fee.types';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { ErrorContent } from '@/components/dashboard/layout/error-content';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export function StudentEnrollmentPage() {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEnrollments() {
      try {
        const response = await getMyEnrollments();
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setEnrollments(response.data);
        }
      } catch (err) {
        setError('Failed to load enrollments');
      } finally {
        setLoading(false);
      }
    }

    fetchEnrollments();
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorContent />;

  return (
    <div className="grid gap-6">
      <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
        <CardHeader className="p-0 space-y-0">
          <CardTitle className="flex justify-between items-center pb-6 border-border border-b">
            <span className={'text-xl font-medium'}>My Enrollments</span>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Enrollment
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className={'p-0 pt-6'}>
          {enrollments.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No Enrollments</h3>
              <p className="text-muted-foreground mb-6">
                You haven't enrolled in any programs yet. Start your academic journey today!
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Enroll Now
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="border-border">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold">
                              {enrollment.specialty?.department?.school?.name}
                            </h3>
                            <p className="text-muted-foreground">
                              {enrollment.specialty?.department?.name} - {enrollment.specialty?.name}
                            </p>
                          </div>
                          <Badge variant={
                            enrollment.status === 'active' ? 'default' :
                            enrollment.status === 'suspended' ? 'destructive' :
                            enrollment.status === 'graduated' ? 'secondary' : 'outline'
                          }>
                            {enrollment.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Student ID:</span>
                            <p className="font-medium">{enrollment.student_id}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Academic Year:</span>
                            <p className="font-medium">{enrollment.academic_year}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Enrollment Date:</span>
                            <p className="font-medium">
                              {formatDate(enrollment.enrollment_date)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <p className="font-medium">
                              {enrollment.specialty?.duration_years} year(s)
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-muted/50 rounded-lg p-4">
                          <h4 className="font-semibold mb-2">Fee Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total Fee:</span>
                              <span className="font-semibold">
                                ${enrollment.fee_structure?.total_amount?.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Currency:</span>
                              <span>{enrollment.fee_structure?.currency}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Installments:</span>
                              <span>
                                {enrollment.fee_structure?.allows_installments ? 'Available' : 'Not Available'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                          <Button size="sm" className="flex-1">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pay Fees
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}