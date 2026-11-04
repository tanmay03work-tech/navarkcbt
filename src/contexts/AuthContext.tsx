import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Institution, UserRole } from '@/types';
import { institutionService } from '@/services/institution.service';
import { authService, AuthResult } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  institution: Institution | null;
  role: UserRole | 'VISITOR';
  isAuthenticated: boolean;
  login: (
    institutionCode: string,
    userId: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<AuthResult>;
  logout: () => void;
  switchDemoRole: (role: UserRole | 'VISITOR', institutionCode?: string) => Promise<AuthResult>;
  updateUserProfile: (updates: Partial<User>) => void;
  availableInstitutions: Institution[];
  rememberedInstitutionCode: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const session = authService.getCurrentSession();
    return session?.user || null;
  });

  const [institution, setInstitution] = useState<Institution | null>(() => {
    const session = authService.getCurrentSession();
    return session?.institution || null;
  });

  const [rememberedCode, setRememberedCode] = useState<string>(() => {
    return authService.getRememberedInstitutionCode();
  });

  const [availableInstitutions, setAvailableInstitutions] = useState<Institution[]>([]);

  useEffect(() => {
    institutionService.getAllInstitutions().then(insts => {
      setAvailableInstitutions(insts);
    }).catch(err => {
      console.error('Failed to load available institutions:', err);
    });
  }, []);

  // Login handler
  const login = async (
    institutionCode: string,
    userId: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<AuthResult> => {
    const result = await authService.login({
      institutionCode,
      userId,
      password,
      rememberMe,
    });

    if (result.success && result.user) {
      setUser(result.user);
      setInstitution(result.institution || null);
      if (rememberMe) {
        setRememberedCode(institutionCode.trim().toUpperCase());
      }
    }

    return result;
  };

  // Secure logout handler
  const logout = () => {
    authService.logout();
    setUser(null);
    setInstitution(null);
  };

  // Switch demo persona (for testing all roles without manual re-typing)
  const switchDemoRole = async (
    targetRole: UserRole | 'VISITOR',
    institutionCode: string = 'APEX'
  ): Promise<AuthResult> => {
    if (targetRole === 'VISITOR') {
      logout();
      return { success: true };
    }

    if (targetRole === 'SUPER_ADMIN') {
      const superAdminCredentials = {
        institutionCode: 'NAWARK',
        userId: 'NawarK_Admin',
        password: 'NawarK@Admin',
        rememberMe: true,
      };
      const res = await authService.login(superAdminCredentials);
      if (res.user) {
        setUser(res.user);
        setInstitution(res.institution || null);
      }
      return res;
    }

    let defaultUserId = 'ADMIN';
    if (targetRole === 'TEACHER') defaultUserId = 'TCH101';
    if (targetRole === 'STUDENT') defaultUserId = 'STU001';

    const res = await authService.login({
      institutionCode,
      userId: defaultUserId,
      password: 'password123',
      rememberMe: true,
    });

    if (res.user) {
      setUser(res.user);
      setInstitution(res.institution || null);
    }
    return res;
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!user) return;
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      // Sync active session
      authService.saveSession(
        updated,
        institution,
        localStorage.getItem('navark_auth_remember') === 'true'
      );
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        institution,
        role: user ? user.role : 'VISITOR',
        isAuthenticated: !!user,
        login,
        logout,
        switchDemoRole,
        updateUserProfile,
        availableInstitutions,
        rememberedInstitutionCode: rememberedCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
