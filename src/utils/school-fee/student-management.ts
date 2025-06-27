'use server';

import { createClient } from '@/utils/supabase/server-internal';
import { createClient as createAuthClient } from '@/utils/supabase/server';

export interface StudentRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  departmentId: string;
  specialtyId: string;
  academicYear?: string;
}

export interface BulkRegistrationResult {
  success: StudentRegistrationData[];
  errors: { row: number; data: StudentRegistrationData; error: string }[];
  totalProcessed: number;
}

// Generate secure random password
function generateSecurePassword(): string {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each category
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate student data
function validateStudentData(data: StudentRegistrationData): string | null {
  if (!data.firstName?.trim()) return 'First name is required';
  if (!data.lastName?.trim()) return 'Last name is required';
  if (!data.email?.trim()) return 'Email is required';
  if (!isValidEmail(data.email)) return 'Invalid email format';
  if (!data.studentId?.trim()) return 'Student ID is required';
  if (!data.departmentId?.trim()) return 'Department is required';
  if (!data.specialtyId?.trim()) return 'Specialty is required';
  
  return null;
}

// Send welcome email to student
async function sendWelcomeEmail(
  studentData: StudentRegistrationData, 
  password: string, 
  schoolName: string
): Promise<boolean> {
  try {
    // In a real implementation, you would use an email service like SendGrid, AWS SES, etc.
    // For now, we'll log the email content and return true
    console.log(`
      Welcome Email for ${studentData.firstName} ${studentData.lastName}
      Email: ${studentData.email}
      Student ID: ${studentData.studentId}
      School: ${schoolName}
      
      Login Credentials:
      Email: ${studentData.email}
      Password: ${password}
      
      Please log in to the student portal to access your account.
    `);
    
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

// Register a single student
export async function registerStudent(
  studentData: StudentRegistrationData
): Promise<{ success: boolean; error?: string; studentId?: string }> {
  try {
    // Validate input data
    const validationError = validateStudentData(studentData);
    if (validationError) {
      return { success: false, error: validationError };
    }

    const supabase = await createClient();
    const authClient = await createAuthClient();
    
    // Get current user (school admin)
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get school information
    const { data: school } = await supabase
      .from('schools')
      .select('*')
      .eq('admin_user_id', user.id)
      .single();

    if (!school) {
      return { success: false, error: 'School not found' };
    }

    // Check if student ID already exists in this school
    const { data: existingStudent } = await supabase
      .from('student_enrollments')
      .select('student_id')
      .eq('student_id', studentData.studentId)
      .eq('specialty_id', studentData.specialtyId)
      .single();

    if (existingStudent) {
      return { success: false, error: 'Student ID already exists in this program' };
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('student_enrollments')
      .select('email')
      .eq('email', studentData.email)
      .single();

    if (existingEmail) {
      return { success: false, error: 'Email already registered' };
    }

    // Verify department and specialty exist and belong to the school
    const { data: specialty } = await supabase
      .from('specialties')
      .select(`
        *,
        department:departments(
          *,
          school:schools(*)
        )
      `)
      .eq('id', studentData.specialtyId)
      .eq('department_id', studentData.departmentId)
      .eq('department.school_id', school.id)
      .single();

    if (!specialty) {
      return { success: false, error: 'Invalid department or specialty' };
    }

    // Get fee structure for the specialty
    const currentYear = new Date().getFullYear();
    const academicYear = studentData.academicYear || `${currentYear}-${currentYear + 1}`;
    
    const { data: feeStructure } = await supabase
      .from('fee_structures')
      .select('*')
      .eq('specialty_id', studentData.specialtyId)
      .eq('academic_year', academicYear)
      .eq('is_active', true)
      .single();

    if (!feeStructure) {
      return { success: false, error: 'No active fee structure found for this program' };
    }

    // Generate secure password
    const password = generateSecurePassword();

    // Create user account in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: studentData.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: studentData.firstName,
        last_name: studentData.lastName,
        role: 'student',
        student_id: studentData.studentId,
        school_id: school.id
      }
    });

    if (authError || !authUser.user) {
      return { success: false, error: `Failed to create user account: ${authError?.message}` };
    }

    // Create student enrollment record
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('student_enrollments')
      .insert({
        student_user_id: authUser.user.id,
        specialty_id: studentData.specialtyId,
        fee_structure_id: feeStructure.id,
        student_id: studentData.studentId,
        first_name: studentData.firstName,
        last_name: studentData.lastName,
        email: studentData.email,
        academic_year: academicYear,
        status: 'active'
      })
      .select()
      .single();

    if (enrollmentError) {
      // Rollback: Delete the created user
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return { success: false, error: `Failed to create enrollment: ${enrollmentError.message}` };
    }

    // Create payment plan
    const { error: paymentPlanError } = await supabase
      .from('payment_plans')
      .insert({
        enrollment_id: enrollment.id,
        plan_type: 'full',
        total_amount: feeStructure.total_amount,
        paid_amount: 0,
        outstanding_amount: feeStructure.total_amount,
        number_of_installments: 1,
        status: 'active'
      });

    if (paymentPlanError) {
      console.error('Failed to create payment plan:', paymentPlanError);
      // Don't fail the registration for this, but log the error
    }

    // Send welcome email
    const emailSent = await sendWelcomeEmail(studentData, password, school.name);
    if (!emailSent) {
      console.warn('Failed to send welcome email to:', studentData.email);
    }

    return { success: true, studentId: enrollment.id };

  } catch (error) {
    console.error('Error registering student:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Register multiple students from CSV data
export async function registerStudentsBulk(
  studentsData: StudentRegistrationData[]
): Promise<BulkRegistrationResult> {
  const result: BulkRegistrationResult = {
    success: [],
    errors: [],
    totalProcessed: studentsData.length
  };

  for (let i = 0; i < studentsData.length; i++) {
    const studentData = studentsData[i];
    
    try {
      const registrationResult = await registerStudent(studentData);
      
      if (registrationResult.success) {
        result.success.push(studentData);
      } else {
        result.errors.push({
          row: i + 1,
          data: studentData,
          error: registrationResult.error || 'Unknown error'
        });
      }
    } catch (error) {
      result.errors.push({
        row: i + 1,
        data: studentData,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return result;
}

// Parse CSV data
export function parseCSVData(csvContent: string): { data: StudentRegistrationData[]; errors: string[] } {
  const lines = csvContent.trim().split('\n');
  const errors: string[] = [];
  const data: StudentRegistrationData[] = [];

  if (lines.length < 2) {
    errors.push('CSV file must contain at least a header row and one data row');
    return { data, errors };
  }

  // Expected headers
  const expectedHeaders = ['firstName', 'lastName', 'email', 'studentId', 'departmentId', 'specialtyId'];
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

  // Validate headers
  for (const expectedHeader of expectedHeaders) {
    if (!headers.includes(expectedHeader)) {
      errors.push(`Missing required column: ${expectedHeader}`);
    }
  }

  if (errors.length > 0) {
    return { data, errors };
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
    
    if (row.length !== headers.length) {
      errors.push(`Row ${i + 1}: Column count mismatch`);
      continue;
    }

    const studentData: StudentRegistrationData = {
      firstName: row[headers.indexOf('firstName')] || '',
      lastName: row[headers.indexOf('lastName')] || '',
      email: row[headers.indexOf('email')] || '',
      studentId: row[headers.indexOf('studentId')] || '',
      departmentId: row[headers.indexOf('departmentId')] || '',
      specialtyId: row[headers.indexOf('specialtyId')] || '',
      academicYear: row[headers.indexOf('academicYear')] || undefined
    };

    const validationError = validateStudentData(studentData);
    if (validationError) {
      errors.push(`Row ${i + 1}: ${validationError}`);
      continue;
    }

    data.push(studentData);
  }

  return { data, errors };
}