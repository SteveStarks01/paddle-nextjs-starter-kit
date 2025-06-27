'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Eye } from 'lucide-react';
import { getMySchool } from '@/utils/school-fee/get-schools';
import { School } from '@/lib/school-fee.types';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { ErrorContent } from '@/components/dashboard/layout/error-content';
import Image from 'next/image';

export function SchoolManagement() {
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSchool() {
      try {
        const response = await getMySchool();
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setSchool(response.data);
        }
      } catch (err) {
        setError('Failed to load school information');
      } finally {
        setLoading(false);
      }
    }

    fetchSchool();
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorContent />;

  if (!school) {
    return (
      <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
        <CardHeader className="p-0 space-y-0">
          <CardTitle className="flex justify-between items-center pb-6 border-border border-b">
            <span className={'text-xl font-medium'}>School Setup</span>
          </CardTitle>
        </CardHeader>
        <CardContent className={'p-0 pt-6'}>
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No School Registered</h3>
            <p className="text-muted-foreground mb-6">
              You need to register your school to start managing students and fees.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Register School
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
        <CardHeader className="p-0 space-y-0">
          <CardTitle className="flex justify-between items-center pb-6 border-border border-b">
            <span className={'text-xl font-medium'}>School Information</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                View Public
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className={'p-0 pt-6'}>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">School Name</label>
                <p className="text-lg font-semibold">{school.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">School Code</label>
                <p className="text-base">{school.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-base">{school.email || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-base">{school.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <p className="text-base">{school.address || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <p className="text-base">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    school.is_active 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {school.is_active ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
              {school.logo_url && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Logo</label>
                  <div className="mt-2">
                    <Image 
                      src={school.logo_url} 
                      alt={`${school.name} logo`}
                      width={100}
                      height={100}
                      className="rounded-lg border"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}