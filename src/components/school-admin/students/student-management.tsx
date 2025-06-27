'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Eye, Edit, Upload, Users } from 'lucide-react';
import { getSchoolEnrollments } from '@/utils/school-fee/get-enrollments';
import { StudentEnrollment } from '@/lib/school-fee.types';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { ErrorContent } from '@/components/dashboard/layout/error-content';
import { Badge } from '@/components/ui/badge';
import { AddStudentDialog } from './add-student-dialog';
import { BulkUploadDialog } from './bulk-upload-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function StudentManagement() {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const response = await getSchoolEnrollments();
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setEnrollments(response.data);
      }
    } catch (err) {
      setError('Failed to load student enrollments');
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment =>
    enrollment.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorContent />;

  return (
    <div className="grid gap-6">
      <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
        <CardHeader className="p-0 space-y-0">
          <CardTitle className="flex justify-between items-center pb-6 border-border border-b">
            <div className="flex items-center gap-3">
              <span className={'text-xl font-medium'}>Student Management</span>
              <Badge variant="secondary" className="text-xs">
                {enrollments.length} students
              </Badge>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Students
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowAddDialog(true)}>
                    <Users className="mr-2 h-4 w-4" />
                    Add Individual Student
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowBulkDialog(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Upload (CSV)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className={'p-0 pt-6'}>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search students by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          {filteredEnrollments.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No students found' : 'No students enrolled'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm 
                  ? 'No students match your search criteria. Try adjusting your search terms.'
                  : 'Get started by adding your first student to the system.'
                }
              </p>
              {!searchTerm && (
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Student
                  </Button>
                  <Button variant="outline" onClick={() => setShowBulkDialog(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Upload
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEnrollments.map((enrollment) => (
                <Card key={enrollment.id} className="border-border">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="grid md:grid-cols-4 gap-4 flex-1">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {enrollment.first_name} {enrollment.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{enrollment.student_id}</p>
                          <p className="text-sm text-muted-foreground">{enrollment.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">School</p>
                          <p className="text-sm text-muted-foreground">
                            {enrollment.specialty?.department?.school?.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Program</p>
                          <p className="text-sm text-muted-foreground">
                            {enrollment.specialty?.department?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {enrollment.specialty?.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Enrollment</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(enrollment.enrollment_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {enrollment.academic_year}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          enrollment.status === 'active' ? 'default' :
                          enrollment.status === 'suspended' ? 'destructive' :
                          enrollment.status === 'graduated' ? 'secondary' : 'outline'
                        }>
                          {enrollment.status}
                        </Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
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

      <AddStudentDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={loadEnrollments}
      />

      <BulkUploadDialog
        isOpen={showBulkDialog}
        onClose={() => setShowBulkDialog(false)}
        onSuccess={loadEnrollments}
      />
    </div>
  );
}