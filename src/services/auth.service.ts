import { User, Institution, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';

export interface LoginCredentials {
  institutionCode: string;
  userId: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  institution?: Institution | null;
  redirectPath?: string;
  error?: string;
}

const STORAGE_KEY_USER = 'navark_auth_user';
const STORAGE_KEY_INST = 'navark_auth_institution';
const STORAGE_KEY_REMEMBER = 'navark_auth_remember';
const STORAGE_KEY_INST_CODE = 'navark_remembered_inst_code';

export const authService = {
  /**
   * Primary authentication endpoint connected to Supabase backend RPC.
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const { institutionCode, userId, password, rememberMe = false } = credentials;

    const trimmedCode = (institutionCode || '').trim().toUpperCase();
    const trimmedUserId = (userId || '').trim().toUpperCase();

    if (!trimmedCode) {
      return { success: false, error: 'Please enter your Institution Code.' };
    }
    if (!trimmedUserId) {
      return { success: false, error: 'Please enter your assigned User ID.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your account password.' };
    }

    try {
      const { data, error } = await supabase.rpc('authenticate_user', {
        p_institution_code: trimmedCode,
        p_user_code: trimmedUserId,
        p_password: password,
      });

      if (error) {
        console.error('Supabase authentication RPC error:', error);
        return { success: false, error: error.message || 'Authentication failed' };
      }

      if (!data || !data.success) {
        return {
          success: false,
          error: data?.error || 'Invalid credentials. Please verify your institution code and password.',
        };
      }

      const user: User = data.user;
      const institution: Institution | null = data.institution
        ? {
            id: data.institution.id,
            name: data.institution.name,
            code: data.institution.institution_code,
            slug: data.institution.slug || data.institution.institution_code.toLowerCase(),
            logoUrl: data.institution.logo_url,
            email: data.institution.email || '',
            phone: data.institution.phone || '',
            address: data.institution.address || '',
            city: data.institution.city || '',
            state: data.institution.state || '',
            pincode: data.institution.pincode || '',
            status: data.institution.status,
            settings: data.institution.settings || {},
            totalStudents: 0,
            totalTeachers: 0,
            totalExams: 0,
            createdAt: data.institution.created_at,
          }
        : null;

      this.saveSession(user, institution, rememberMe);

      if (rememberMe) {
        localStorage.setItem(STORAGE_KEY_INST_CODE, trimmedCode);
      } else {
        localStorage.removeItem(STORAGE_KEY_INST_CODE);
      }

      return {
        success: true,
        user,
        institution,
        redirectPath: data.redirectPath || this.getDashboardPath(user.role),
      };
    } catch (err: any) {
      console.error('Auth service exception:', err);
      return { success: false, error: err.message || 'An unexpected authentication error occurred.' };
    }
  },

  /**
   * Save session into sessionStorage or localStorage based on Remember Me preference.
   */
  saveSession(user: User, institution: Institution | null, rememberMe: boolean): void {
    const serializedUser = JSON.stringify(user);
    const serializedInst = institution ? JSON.stringify(institution) : '';

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY_USER, serializedUser);
      if (serializedInst) localStorage.setItem(STORAGE_KEY_INST, serializedInst);
      localStorage.setItem(STORAGE_KEY_REMEMBER, 'true');
      sessionStorage.removeItem(STORAGE_KEY_USER);
      sessionStorage.removeItem(STORAGE_KEY_INST);
    } else {
      sessionStorage.setItem(STORAGE_KEY_USER, serializedUser);
      if (serializedInst) sessionStorage.setItem(STORAGE_KEY_INST, serializedInst);
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_INST);
      localStorage.removeItem(STORAGE_KEY_REMEMBER);
    }
  },

  /**
   * Retrieve current active session on browser refresh or startup.
   */
  getCurrentSession(): { user: User; institution: Institution | null } | null {
    try {
      let storedUser = sessionStorage.getItem(STORAGE_KEY_USER);
      let storedInst = sessionStorage.getItem(STORAGE_KEY_INST);

      if (!storedUser) {
        storedUser = localStorage.getItem(STORAGE_KEY_USER);
        storedInst = localStorage.getItem(STORAGE_KEY_INST);
      }

      if (!storedUser) return null;

      const user: User = JSON.parse(storedUser);
      const institution: Institution | null = storedInst ? JSON.parse(storedInst) : null;

      return { user, institution };
    } catch {
      return null;
    }
  },

  /**
   * Securely terminate session and wipe credentials from storage.
   */
  logout(): void {
    sessionStorage.removeItem(STORAGE_KEY_USER);
    sessionStorage.removeItem(STORAGE_KEY_INST);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_INST);
    localStorage.removeItem(STORAGE_KEY_REMEMBER);
    localStorage.removeItem('navark_demo_user');
  },

  /**
   * Get remembered institution code if saved previously.
   */
  getRememberedInstitutionCode(): string {
    return localStorage.getItem(STORAGE_KEY_INST_CODE) || '';
  },

  /**
   * Verify if a given institution code exists.
   */
  async lookupInstitution(code: string): Promise<Institution | null> {
    const trimmed = code.trim().toUpperCase();
    try {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .ilike('institution_code', trimmed)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        name: data.name,
        code: data.institution_code,
        slug: data.slug || data.institution_code.toLowerCase(),
        logoUrl: data.logo_url,
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
        status: data.status,
        settings: data.settings || {},
        totalStudents: 0,
        totalTeachers: 0,
        totalExams: 0,
        createdAt: data.created_at,
      };
    } catch {
      return null;
    }
  },

  /**
   * Returns default destination dashboard URL for a given role.
   */
  getDashboardPath(role: UserRole | 'VISITOR'): string {
    switch (role) {
      case 'SUPER_ADMIN':
        return '/super-admin';
      case 'INSTITUTION_ADMIN':
        return '/institution';
      case 'TEACHER':
        return '/teacher';
      case 'STUDENT':
        return '/student';
      default:
        return '/login';
    }
  },

  /**
   * Demo quick credentials for easy testing of personas.
   */
  getDemoCredentials() {
    return [
      {
        label: 'Nawark Master Admin',
        institutionCode: 'NAWARK',
        userId: 'NawarK_Admin',
        password: 'NawarK@Admin',
        description: 'Master Super Admin • Full Platform Access',
        role: 'SUPER_ADMIN',
      },
      {
        label: 'Apex Institution Admin',
        institutionCode: 'APEX',
        userId: 'ADMIN',
        password: 'password123',
        description: 'Dr. Alok Verma • Campus Administrator',
        role: 'INSTITUTION_ADMIN',
      },
      {
        label: 'Apex Senior Teacher',
        institutionCode: 'APEX',
        userId: 'TCH101',
        password: 'password123',
        description: 'Prof. Rajesh Kulkarni • Physics Faculty',
        role: 'TEACHER',
      },
      {
        label: 'Apex Student',
        institutionCode: 'APEX',
        userId: 'STU001',
        password: 'password123',
        description: 'Aarav Sharma • Class 12 Batch Alpha',
        role: 'STUDENT',
      },
    ];
  },
};
