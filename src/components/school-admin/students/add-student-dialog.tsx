'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { registerStudent, StudentRegistrationData } from '@/utils/school-fee/student-management';
import { getMyDepartments } from '@/utils/school-fee/get-departments';
import { getSpecialtiesByDepartment } from '@/utils/school-fee/get-specialties';
import { Department, Specialty } from '@/lib/school-fee.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddStudentDialog({ isOpen, onClose, onSuccess }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [formData, setFormData] = useState<StudentRegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    departmentId: '',
    specialtyId: '',
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
  });

  useEffect(() => {
    if (isOpen) {
      loadDepartments();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.departmentId) {
      loadSpecialties(formData.departmentId);
    } else {
      setSpecialties([]);
      setFormData(prev => ({ ...prev, specialtyId: '' }));
    }
  }, [formData.departmentId]);

  const loadDepartments = async () => {
    try {
      const response = await getMyDepartments();
      if (response.data) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadSpecialties = async (departmentId: string) => {
    try {
      const response = await getSpecialtiesByDepartment(departmentId);
      if (response.data) {
        setSpecialties(response.data);
      }
    } catch (error) {
      console.error('Failed to load specialties:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await registerStudent(formData);
      
      if (result.success) {
        toast({
          title: 'Student registered successfully',
          description: 'Login credentials have been sent to the student\'s email address.',
        });
        onSuccess();
        onClose();
        resetForm();
      } else {
        toast({
          title: 'Registration failed',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      studentId: '',
      departmentId: '',
      specialtyId: '',
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
    });
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="studentId">Student ID/Matricule *</Label>
            <Input
              id="studentId"
              value={formData.studentId}
              onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="department">Department *</Label>
            <Select
              value={formData.departmentId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, departmentId: value }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="specialty">Specialty/Major *</Label>
            <Select
              value={formData.specialtyId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, specialtyId: value }))}
              disabled={loading || !formData.departmentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="academicYear">Academic Year</Label>
            <Input
              id="academicYear"
              value={formData.academicYear}
              onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register Student
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}