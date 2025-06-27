import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Building, GraduationCap } from 'lucide-react';
import Link from 'next/link';

const quickActions = [
  {
    title: 'Add New Student',
    description: 'Enroll a new student',
    icon: <Users size={20} />,
    href: '/school-admin/students/new',
  },
  {
    title: 'Create Department',
    description: 'Add a new department',
    icon: <Building size={20} />,
    href: '/school-admin/departments/new',
  },
  {
    title: 'Add Specialty',
    description: 'Create new specialty',
    icon: <GraduationCap size={20} />,
    href: '/school-admin/specialties/new',
  },
];

export function SchoolAdminQuickActions() {
  return (
    <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
      <CardHeader className="p-0 space-y-0">
        <CardTitle className="flex justify-between items-center text-xl mb-6 font-medium">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className={'p-0 flex flex-col gap-4'}>
        {quickActions.map((action) => (
          <Button
            key={action.title}
            asChild
            variant="outline"
            className="h-auto p-4 justify-start border-border hover:bg-accent"
          >
            <Link href={action.href} className="flex items-center gap-3">
              {action.icon}
              <div className="flex flex-col items-start gap-1">
                <span className="font-medium">{action.title}</span>
                <span className="text-sm text-muted-foreground">{action.description}</span>
              </div>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}