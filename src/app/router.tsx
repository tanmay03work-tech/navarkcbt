import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';

// Protected Route Guard
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Layouts
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';

// Public Pages
import { HomePage } from '@/pages/public/HomePage';
import { FeaturesPage } from '@/pages/public/FeaturesPage';
import { HowItWorksPage } from '@/pages/public/HowItWorksPage';
import { AboutPage } from '@/pages/public/AboutPage';
import { ContactPage } from '@/pages/public/ContactPage';
import { FaqPage } from '@/pages/public/FaqPage';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { AcceptInvitationPage } from '@/pages/auth/AcceptInvitationPage';
import { UnauthorizedPage } from '@/pages/auth/UnauthorizedPage';

// Super Admin Pages
import { SuperAdminOverviewPage } from '@/pages/super-admin/SuperAdminOverviewPage';
import { InstitutionsListPage } from '@/pages/super-admin/InstitutionsListPage';
import { CreateInstitutionPage } from '@/pages/super-admin/CreateInstitutionPage';
import { InstitutionDetailPage } from '@/pages/super-admin/InstitutionDetailPage';
import { EditInstitutionBrandingPage } from '@/pages/super-admin/EditInstitutionBrandingPage';
import { InstitutionRequestsPage } from '@/pages/super-admin/InstitutionRequestsPage';
import { PlatformUsersPage } from '@/pages/super-admin/PlatformUsersPage';
import { PlatformAnalyticsPage } from '@/pages/super-admin/PlatformAnalyticsPage';
import { PlatformSettingsPage } from '@/pages/super-admin/PlatformSettingsPage';

// Institution Admin Pages
import { InstitutionDashboardPage } from '@/pages/institution/InstitutionDashboardPage';
import { InstitutionProfilePage } from '@/pages/institution/InstitutionProfilePage';
import { StudentsListPage } from '@/pages/institution/StudentsListPage';
import { AddEditStudentPage } from '@/pages/institution/AddEditStudentPage';
import { StudentDetailPage } from '@/pages/institution/StudentDetailPage';
import { TeachersListPage } from '@/pages/institution/TeachersListPage';
import { AddEditTeacherPage } from '@/pages/institution/AddEditTeacherPage';
import { TeacherDetailPage } from '@/pages/institution/TeacherDetailPage';
import { BatchesPage } from '@/pages/institution/BatchesPage';
import { SubjectsPage } from '@/pages/institution/SubjectsPage';
import { QuestionBankPage } from '@/pages/institution/QuestionBankPage';
import { CreateEditQuestionPage } from '@/pages/institution/CreateEditQuestionPage';
import { QuestionPreviewPage } from '@/pages/institution/QuestionPreviewPage';
import { BulkImportQuestionsPage } from '@/pages/institution/BulkImportQuestionsPage';
import { ExamsListPage } from '@/pages/institution/ExamsListPage';
import { CreateEditExamPage } from '@/pages/institution/CreateEditExamPage';
import { ExamDetailPage } from '@/pages/institution/ExamDetailPage';
import { ResultsListPage } from '@/pages/institution/ResultsListPage';
import { InstitutionAnalyticsPage } from '@/pages/institution/InstitutionAnalyticsPage';
import { StudyMaterialsPage } from '@/pages/institution/StudyMaterialsPage';
import { AnnouncementsPage } from '@/pages/institution/AnnouncementsPage';
import { InstitutionSettingsPage } from '@/pages/institution/InstitutionSettingsPage';

// Teacher Pages
import { TeacherDashboardPage } from '@/pages/teacher/TeacherDashboardPage';
import { TeacherBatchesPage } from '@/pages/teacher/TeacherBatchesPage';
import { TeacherStudentsPage } from '@/pages/teacher/TeacherStudentsPage';
import { TeacherQuestionsPage } from '@/pages/teacher/TeacherQuestionsPage';
import { TeacherExamsPage } from '@/pages/teacher/TeacherExamsPage';
import { TeacherExamMonitoringPage } from '@/pages/teacher/TeacherExamMonitoringPage';
import { TeacherResultsPage } from '@/pages/teacher/TeacherResultsPage';
import { TeacherAnalyticsPage } from '@/pages/teacher/TeacherAnalyticsPage';
import { TeacherMaterialsPage } from '@/pages/teacher/TeacherMaterialsPage';
import { TeacherSettingsPage } from '@/pages/teacher/TeacherSettingsPage';

// Student Pages
import { StudentDashboardPage } from '@/pages/student/StudentDashboardPage';
import { StudentProfilePage } from '@/pages/student/StudentProfilePage';
import { StudentExamsPage } from '@/pages/student/StudentExamsPage';
import { UpcomingExamsPage } from '@/pages/student/UpcomingExamsPage';
import { ExamInstructionsPage } from '@/pages/student/ExamInstructionsPage';
import { CbtExamPlayerPage } from '@/pages/student/CbtExamPlayerPage';
import { ExamSubmissionSuccessPage } from '@/pages/student/ExamSubmissionSuccessPage';
import { StudentResultsPage } from '@/pages/student/StudentResultsPage';
import { StudentResultDetailPage } from '@/pages/student/StudentResultDetailPage';
import { StudentPerformancePage } from '@/pages/student/StudentPerformancePage';
import { StudentMaterialsPage } from '@/pages/student/StudentMaterialsPage';
import { StudentAnnouncementsPage } from '@/pages/student/StudentAnnouncementsPage';

// System & Shared Pages
import { NotificationsPage } from '@/pages/system/NotificationsPage';
import { HelpPage } from '@/pages/system/HelpPage';
import { AccountSettingsPage } from '@/pages/system/AccountSettingsPage';
import { ChangePasswordPage } from '@/pages/system/ChangePasswordPage';
import { GlobalSearchPage } from '@/pages/system/GlobalSearchPage';
import { NotFoundPage } from '@/pages/system/NotFoundPage';
import { ServiceUnavailablePage } from '@/pages/system/ServiceUnavailablePage';

/**
 * Root Entry Point Controller:
 * When users open the application URL (/):
 * - If unauthenticated: redirect immediately to /login.
 * - If authenticated: redirect to their role-specific dashboard.
 */
const RootRedirect: React.FC = () => {
  const { isAuthenticated, role, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const destination = authService.getDashboardPath(role);
  return <Navigate to={destination} replace />;
};

export const router = createBrowserRouter([
  // 1. Root Application Entry Point: Login Portal is the first screen
  {
    path: '/',
    element: <RootRedirect />,
  },

  // 2. Authentication Portal Section
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'accept-invitation', element: <AcceptInvitationPage /> },
      { path: 'unauthorized', element: <UnauthorizedPage /> },
    ],
  },

  // 3. Standalone Distraction-Free CBT Exam Player (Protected: Student Role & Super Admin)
  {
    element: <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']} />,
    children: [
      {
        path: 'student/exams/:examId/attempt',
        element: <CbtExamPlayerPage />,
      },
      {
        path: 'student/exams/:examId/submitted',
        element: <ExamSubmissionSuccessPage />,
      },
    ],
  },

  // 4. Authenticated Dashboard Shell (Protected: All Roles)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          // Platform Super Admin (Protected: SUPER_ADMIN Only)
          {
            element: <ProtectedRoute allowedRoles={['SUPER_ADMIN']} />,
            children: [
              { path: 'super-admin', element: <SuperAdminOverviewPage /> },
              { path: 'super-admin/institutions', element: <InstitutionsListPage /> },
              { path: 'super-admin/institutions/new', element: <CreateInstitutionPage /> },
              { path: 'super-admin/institutions/:institutionId', element: <InstitutionDetailPage /> },
              { path: 'super-admin/institutions/:institutionId/branding', element: <EditInstitutionBrandingPage /> },
              { path: 'super-admin/requests', element: <InstitutionRequestsPage /> },
              { path: 'super-admin/users', element: <PlatformUsersPage /> },
              { path: 'super-admin/analytics', element: <PlatformAnalyticsPage /> },
              { path: 'super-admin/settings', element: <PlatformSettingsPage /> },
            ],
          },

          // Institution Admin (Protected: INSTITUTION_ADMIN & SUPER_ADMIN)
          {
            element: <ProtectedRoute allowedRoles={['INSTITUTION_ADMIN', 'SUPER_ADMIN']} />,
            children: [
              { path: 'institution', element: <InstitutionDashboardPage /> },
              { path: 'institution/profile', element: <InstitutionProfilePage /> },
              { path: 'institution/students', element: <StudentsListPage /> },
              { path: 'institution/students/new', element: <AddEditStudentPage /> },
              { path: 'institution/students/:id', element: <StudentDetailPage /> },
              { path: 'institution/students/:id/edit', element: <AddEditStudentPage /> },
              { path: 'institution/teachers', element: <TeachersListPage /> },
              { path: 'institution/teachers/new', element: <AddEditTeacherPage /> },
              { path: 'institution/teachers/:id', element: <TeacherDetailPage /> },
              { path: 'institution/teachers/:id/edit', element: <AddEditTeacherPage /> },
              { path: 'institution/batches', element: <BatchesPage /> },
              { path: 'institution/subjects', element: <SubjectsPage /> },
              { path: 'institution/questions', element: <QuestionBankPage /> },
              { path: 'institution/questions/new', element: <CreateEditQuestionPage /> },
              { path: 'institution/questions/:id', element: <QuestionPreviewPage /> },
              { path: 'institution/questions/:id/edit', element: <CreateEditQuestionPage /> },
              { path: 'institution/questions/import', element: <BulkImportQuestionsPage /> },
              { path: 'institution/exams', element: <ExamsListPage /> },
              { path: 'institution/exams/new', element: <CreateEditExamPage /> },
              { path: 'institution/exams/:examId', element: <ExamDetailPage /> },
              { path: 'institution/exams/:examId/edit', element: <CreateEditExamPage /> },
              { path: 'institution/exams/:examId/attempts', element: <ExamDetailPage /> },
              { path: 'institution/results', element: <ResultsListPage /> },
              { path: 'institution/analytics', element: <InstitutionAnalyticsPage /> },
              { path: 'institution/materials', element: <StudyMaterialsPage /> },
              { path: 'institution/announcements', element: <AnnouncementsPage /> },
              { path: 'institution/settings', element: <InstitutionSettingsPage /> },
            ],
          },

          // Teacher / Exam Manager (Protected: TEACHER, INSTITUTION_ADMIN & SUPER_ADMIN)
          {
            element: <ProtectedRoute allowedRoles={['TEACHER', 'INSTITUTION_ADMIN', 'SUPER_ADMIN']} />,
            children: [
              { path: 'teacher', element: <TeacherDashboardPage /> },
              { path: 'teacher/batches', element: <TeacherBatchesPage /> },
              { path: 'teacher/students', element: <TeacherStudentsPage /> },
              { path: 'teacher/questions', element: <TeacherQuestionsPage /> },
              { path: 'teacher/questions/new', element: <CreateEditQuestionPage /> },
              { path: 'teacher/questions/:id/edit', element: <CreateEditQuestionPage /> },
              { path: 'teacher/questions/import', element: <BulkImportQuestionsPage /> },
              { path: 'teacher/exams', element: <TeacherExamsPage /> },
              { path: 'teacher/exams/new', element: <CreateEditExamPage /> },
              { path: 'teacher/exams/:examId', element: <TeacherExamMonitoringPage /> },
              { path: 'teacher/exams/:examId/edit', element: <CreateEditExamPage /> },
              { path: 'teacher/results', element: <TeacherResultsPage /> },
              { path: 'teacher/analytics', element: <TeacherAnalyticsPage /> },
              { path: 'teacher/materials', element: <TeacherMaterialsPage /> },
              { path: 'teacher/profile', element: <AccountSettingsPage /> },
              { path: 'teacher/settings', element: <TeacherSettingsPage /> },
            ],
          },

          // Student (Protected: STUDENT & SUPER_ADMIN)
          {
            element: <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']} />,
            children: [
              { path: 'student', element: <StudentDashboardPage /> },
              { path: 'student/profile', element: <StudentProfilePage /> },
              { path: 'student/exams', element: <StudentExamsPage /> },
              { path: 'student/exams/upcoming', element: <UpcomingExamsPage /> },
              { path: 'student/exams/:examId/instructions', element: <ExamInstructionsPage /> },
              { path: 'student/results', element: <StudentResultsPage /> },
              { path: 'student/results/:resultId', element: <StudentResultDetailPage /> },
              { path: 'student/performance', element: <StudentPerformancePage /> },
              { path: 'student/materials', element: <StudentMaterialsPage /> },
              { path: 'student/announcements', element: <StudentAnnouncementsPage /> },
            ],
          },

          // Shared System & Settings Pages (Protected: Any Authenticated User)
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'help', element: <HelpPage /> },
          { path: 'settings', element: <AccountSettingsPage /> },
          { path: 'settings/change-password', element: <ChangePasswordPage /> },
          { path: 'search', element: <GlobalSearchPage /> },
        ],
      },
    ],
  },

  // 5. Preserved Public Pages (Accessible via bookmarks or public links)
  {
    element: <PublicLayout />,
    children: [
      { path: 'home', element: <HomePage /> },
      { path: 'features', element: <FeaturesPage /> },
      { path: 'how-it-works', element: <HowItWorksPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'faq', element: <FaqPage /> },
    ],
  },

  // 6. System Fallbacks
  { path: 'service-unavailable', element: <ServiceUnavailablePage /> },
  { path: '*', element: <NotFoundPage /> },
]);
