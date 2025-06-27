'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Users } from 'lucide-react';
import { getMyDepartments } from '@/utils/school-fee/get-departments';
import { Department } from '@/lib/school-fee.types';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { ErrorContent } from '@/components/dashboard/layout/error-content';

export function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const response = await getMyDepartments();
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setDepartments(response.data);
        }
      } catch (err) {
        setError('Failed to load departments');
      } finally {
        setLoading(false);
      }
    }

    fetchDepartments();
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorContent />;

  return (
    <div className="grid gap-6">
      <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
        <CardHeader className="p-0 space-y-0">
          <CardTitle className="flex justify-between items-center pb-6 border-border border-b">
            <span className={'text-xl font-medium'}>Departments</span>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className={'p-0 pt-6'}>
          {departments.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No Departments</h3>
              <p className="text-muted-foreground mb-6">
                Create your first department to organize your academic programs.
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Department
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {departments.map((department) => (
                <Card key={department.id} className="border-border">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{department.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{department.code}</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4">
                      {department.description || 'No description provided'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>0 specialties</span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        department.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {department.is_active ? 'Active' : 'Inactive'}
                      </span>
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