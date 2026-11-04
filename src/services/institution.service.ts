import { Institution, InstitutionRequest, Batch, Subject, User } from '@/types';
import { supabase } from '@/lib/supabase';

export const institutionService = {
  // Institutions
  async getAllInstitutions(): Promise<Institution[]> {
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching institutions:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      code: row.institution_code,
      slug: row.slug || row.institution_code.toLowerCase(),
      logoUrl: row.logo_url,
      email: row.email || '',
      phone: row.phone || '',
      address: row.address || '',
      city: row.city || '',
      state: row.state || '',
      pincode: row.pincode || '',
      status: row.status,
      settings: row.settings || {},
      totalStudents: 0,
      totalTeachers: 0,
      totalExams: 0,
      createdAt: row.created_at,
    }));
  },

  async getInstitutionById(id: string): Promise<Institution | null> {
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .eq('id', id)
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
  },

  async createInstitution(data: Omit<Institution, 'id' | 'createdAt' | 'totalStudents' | 'totalTeachers' | 'totalExams'>): Promise<Institution> {
    const insertPayload = {
      institution_code: data.code.toUpperCase().trim(),
      name: data.name.trim(),
      slug: data.slug || data.code.toLowerCase().trim(),
      logo_url: data.logoUrl,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      status: data.status || 'ACTIVE',
      settings: data.settings || {},
    };

    const { data: inserted, error } = await supabase
      .from('institutions')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) {
      console.error('Failed to create institution:', error);
      throw new Error(error.message);
    }

    return {
      id: inserted.id,
      name: inserted.name,
      code: inserted.institution_code,
      slug: inserted.slug,
      logoUrl: inserted.logo_url,
      email: inserted.email || '',
      phone: inserted.phone || '',
      address: inserted.address || '',
      city: inserted.city || '',
      state: inserted.state || '',
      pincode: inserted.pincode || '',
      status: inserted.status,
      settings: inserted.settings || {},
      totalStudents: 0,
      totalTeachers: 0,
      totalExams: 0,
      createdAt: inserted.created_at,
    };
  },

  async updateInstitution(id: string, updates: Partial<Institution>): Promise<Institution> {
    const patchPayload: Record<string, any> = {};
    if (updates.name !== undefined) patchPayload.name = updates.name;
    if (updates.code !== undefined) patchPayload.institution_code = updates.code.toUpperCase().trim();
    if (updates.slug !== undefined) patchPayload.slug = updates.slug;
    if (updates.logoUrl !== undefined) patchPayload.logo_url = updates.logoUrl;
    if (updates.email !== undefined) patchPayload.email = updates.email;
    if (updates.phone !== undefined) patchPayload.phone = updates.phone;
    if (updates.address !== undefined) patchPayload.address = updates.address;
    if (updates.city !== undefined) patchPayload.city = updates.city;
    if (updates.state !== undefined) patchPayload.state = updates.state;
    if (updates.pincode !== undefined) patchPayload.pincode = updates.pincode;
    if (updates.status !== undefined) patchPayload.status = updates.status;
    if (updates.settings !== undefined) patchPayload.settings = updates.settings;

    const { data: updated, error } = await supabase
      .from('institutions')
      .update(patchPayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Failed to update institution:', error);
      throw new Error(error.message);
    }

    return {
      id: updated.id,
      name: updated.name,
      code: updated.institution_code,
      slug: updated.slug,
      logoUrl: updated.logo_url,
      email: updated.email || '',
      phone: updated.phone || '',
      address: updated.address || '',
      city: updated.city || '',
      state: updated.state || '',
      pincode: updated.pincode || '',
      status: updated.status,
      settings: updated.settings || {},
      totalStudents: 0,
      totalTeachers: 0,
      totalExams: 0,
      createdAt: updated.created_at,
    };
  },

  async toggleSuspendInstitution(id: string): Promise<Institution> {
    const current = await this.getInstitutionById(id);
    if (!current) throw new Error('Institution not found');
    const newStatus = current.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    return this.updateInstitution(id, { status: newStatus });
  },

  // Onboarding Requests
  async getInstitutionRequests(): Promise<InstitutionRequest[]> {
    const { data, error } = await supabase
      .from('institution_requests')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('Error fetching institution requests:', error);
      return [];
    }

    return (data || []).map((r: any) => ({
      id: r.id,
      institutionName: r.institution_name,
      proposedCode: r.proposed_code,
      contactPerson: r.contact_person,
      email: r.email,
      phone: r.phone,
      address: r.address || '',
      studentEstimate: r.student_estimate || 0,
      notes: r.notes || '',
      status: r.status,
      requestedAt: r.requested_at,
      reviewedAt: r.reviewed_at,
      internalNotes: r.internal_notes,
    }));
  },

  async submitInstitutionRequest(data: Omit<InstitutionRequest, 'id' | 'status' | 'requestedAt'>): Promise<InstitutionRequest> {
    const { data: inserted, error } = await supabase
      .from('institution_requests')
      .insert({
        institution_name: data.institutionName,
        proposed_code: data.proposedCode.toUpperCase(),
        contact_person: data.contactPerson,
        email: data.email,
        phone: data.phone,
        address: data.address,
        student_estimate: data.studentEstimate || 0,
        notes: data.notes,
        status: 'PENDING',
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error submitting request:', error);
      throw new Error(error.message);
    }

    return {
      id: inserted.id,
      institutionName: inserted.institution_name,
      proposedCode: inserted.proposed_code,
      contactPerson: inserted.contact_person,
      email: inserted.email,
      phone: inserted.phone,
      address: inserted.address,
      studentEstimate: inserted.student_estimate,
      notes: inserted.notes,
      status: inserted.status,
      requestedAt: inserted.requested_at,
    };
  },

  async reviewRequest(id: string, status: 'APPROVED' | 'REJECTED', internalNotes?: string): Promise<InstitutionRequest> {
    const { data: updated, error } = await supabase
      .from('institution_requests')
      .update({
        status,
        internal_notes: internalNotes,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error reviewing request:', error);
      throw new Error(error.message);
    }

    if (status === 'APPROVED') {
      // Auto-provision institution
      await this.createInstitution({
        name: updated.institution_name,
        code: updated.proposed_code,
        slug: updated.proposed_code.toLowerCase(),
        email: updated.email,
        phone: updated.phone,
        address: updated.address || '',
        city: 'City Center',
        state: 'State',
        pincode: '100001',
        status: 'ACTIVE',
      });
    }

    return {
      id: updated.id,
      institutionName: updated.institution_name,
      proposedCode: updated.proposed_code,
      contactPerson: updated.contact_person,
      email: updated.email,
      phone: updated.phone,
      address: updated.address,
      studentEstimate: updated.student_estimate,
      notes: updated.notes,
      status: updated.status,
      requestedAt: updated.requested_at,
      reviewedAt: updated.reviewed_at,
      internalNotes: updated.internal_notes,
    };
  },

  // Batches / Classes
  async getBatchesByInstitution(institutionId: string): Promise<Batch[]> {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('institution_id', institutionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching batches:', error);
      return [];
    }

    return (data || []).map((b: any) => ({
      id: b.id,
      institutionId: b.institution_id,
      name: b.name,
      code: b.code,
      courseName: b.course_name || '',
      academicYear: b.academic_year || '2026-2027',
      studentCount: 0,
      assignedTeacherIds: b.assigned_teacher_ids || [],
      status: b.status,
      createdAt: b.created_at,
    }));
  },

  async createBatch(data: Omit<Batch, 'id' | 'createdAt' | 'studentCount'>): Promise<Batch> {
    const { data: inserted, error } = await supabase
      .from('classes')
      .insert({
        institution_id: data.institutionId,
        name: data.name,
        code: data.code,
        course_name: data.courseName,
        academic_year: data.academicYear,
        status: data.status || 'ACTIVE',
        assigned_teacher_ids: data.assignedTeacherIds || [],
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating batch:', error);
      throw new Error(error.message);
    }

    return {
      id: inserted.id,
      institutionId: inserted.institution_id,
      name: inserted.name,
      code: inserted.code,
      courseName: inserted.course_name,
      academicYear: inserted.academic_year,
      studentCount: 0,
      assignedTeacherIds: inserted.assigned_teacher_ids || [],
      status: inserted.status,
      createdAt: inserted.created_at,
    };
  },

  async updateBatch(id: string, updates: Partial<Batch>): Promise<Batch> {
    const patchPayload: Record<string, any> = {};
    if (updates.name !== undefined) patchPayload.name = updates.name;
    if (updates.code !== undefined) patchPayload.code = updates.code;
    if (updates.courseName !== undefined) patchPayload.course_name = updates.courseName;
    if (updates.academicYear !== undefined) patchPayload.academic_year = updates.academicYear;
    if (updates.status !== undefined) patchPayload.status = updates.status;
    if (updates.assignedTeacherIds !== undefined) patchPayload.assigned_teacher_ids = updates.assignedTeacherIds;

    const { data: updated, error } = await supabase
      .from('classes')
      .update(patchPayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating batch:', error);
      throw new Error(error.message);
    }

    return {
      id: updated.id,
      institutionId: updated.institution_id,
      name: updated.name,
      code: updated.code,
      courseName: updated.course_name,
      academicYear: updated.academic_year,
      studentCount: 0,
      assignedTeacherIds: updated.assigned_teacher_ids || [],
      status: updated.status,
      createdAt: updated.created_at,
    };
  },

  // Subjects
  async getSubjectsByInstitution(institutionId: string): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('institution_id', institutionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }

    return (data || []).map((s: any) => ({
      id: s.id,
      institutionId: s.institution_id,
      name: s.name,
      code: s.code,
      description: s.description || '',
      topicCount: 1,
      questionCount: 0,
      status: s.status,
    }));
  },

  async createSubject(data: Omit<Subject, 'id' | 'topicCount' | 'questionCount'>): Promise<Subject> {
    const { data: inserted, error } = await supabase
      .from('subjects')
      .insert({
        institution_id: data.institutionId,
        name: data.name,
        code: data.code,
        description: data.description,
        status: data.status || 'ACTIVE',
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating subject:', error);
      throw new Error(error.message);
    }

    return {
      id: inserted.id,
      institutionId: inserted.institution_id,
      name: inserted.name,
      code: inserted.code,
      description: inserted.description,
      topicCount: 1,
      questionCount: 0,
      status: inserted.status,
    };
  },

  // Students & Teachers
  async getUsersByInstitutionAndRole(institutionId: string, role: 'STUDENT' | 'TEACHER'): Promise<User[]> {
    const { data, error } = await supabase
      .from('institution_memberships')
      .select(`
        id, user_code, role, status, batch_id, specialization, avatar_url, created_at,
        profiles ( display_name, email, phone ),
        institutions ( institution_code, name ),
        classes ( name )
      `)
      .eq('institution_id', institutionId)
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users by role:', error);
      return [];
    }

    return (data || []).map((m: any) => ({
      id: m.id,
      userId: m.user_code,
      name: m.profiles?.display_name || m.user_code,
      email: m.profiles?.email || '',
      phone: m.profiles?.phone || '',
      role: m.role,
      institutionId,
      institutionCode: m.institutions?.institution_code,
      institutionName: m.institutions?.name,
      batchId: m.batch_id,
      batchName: m.classes?.name,
      status: m.status,
      avatarUrl: m.avatar_url,
      specialization: m.specialization,
      createdAt: m.created_at,
    }));
  },

  async getAllPlatformUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('institution_memberships')
      .select(`
        id, user_code, role, status, batch_id, specialization, avatar_url, created_at,
        profiles ( display_name, email, phone ),
        institutions ( id, institution_code, name ),
        classes ( name )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all platform users:', error);
      return [];
    }

    return (data || []).map((m: any) => ({
      id: m.id,
      userId: m.user_code,
      name: m.profiles?.display_name || m.user_code,
      email: m.profiles?.email || '',
      phone: m.profiles?.phone || '',
      role: m.role,
      institutionId: m.institutions?.id,
      institutionCode: m.institutions?.institution_code,
      institutionName: m.institutions?.name,
      batchId: m.batch_id,
      batchName: m.classes?.name,
      status: m.status,
      avatarUrl: m.avatar_url,
      specialization: m.specialization,
      createdAt: m.created_at,
    }));
  },

  async createUser(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    if (!data.institutionId) {
      throw new Error('Institution ID is required.');
    }

    // 1. Create profile
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .insert({
        display_name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status || 'ACTIVE',
      })
      .select('*')
      .single();

    if (profileErr) {
      throw new Error(`Profile creation failed: ${profileErr.message}`);
    }

    // 2. Create membership
    const { data: member, error: memberErr } = await supabase
      .from('institution_memberships')
      .insert({
        institution_id: data.institutionId,
        profile_id: profile.id,
        user_code: data.userId.toUpperCase().trim(),
        role: data.role,
        status: data.status || 'ACTIVE',
        batch_id: data.batchId || null,
        specialization: data.specialization || [],
        avatar_url: data.avatarUrl,
        password_hash: 'password123', // default seed password
      })
      .select('*')
      .single();

    if (memberErr) {
      throw new Error(`User ID assignment failed: ${memberErr.message}`);
    }

    return {
      ...data,
      id: member.id,
      createdAt: member.created_at,
    };
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    // Fetch membership to get profile_id
    const { data: member, error: fetchErr } = await supabase
      .from('institution_memberships')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !member) {
      throw new Error('User not found');
    }

    // Update profile
    if (updates.name || updates.email || updates.phone) {
      const profileUpdates: any = {};
      if (updates.name) profileUpdates.display_name = updates.name;
      if (updates.email) profileUpdates.email = updates.email;
      if (updates.phone) profileUpdates.phone = updates.phone;

      await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', member.profile_id);
    }

    // Update membership
    const memberUpdates: any = {};
    if (updates.userId) memberUpdates.user_code = updates.userId.toUpperCase().trim();
    if (updates.status) memberUpdates.status = updates.status;
    if (updates.batchId !== undefined) memberUpdates.batch_id = updates.batchId;
    if (updates.specialization) memberUpdates.specialization = updates.specialization;
    if (updates.avatarUrl) memberUpdates.avatar_url = updates.avatarUrl;

    if (Object.keys(memberUpdates).length > 0) {
      await supabase
        .from('institution_memberships')
        .update(memberUpdates)
        .eq('id', id);
    }

    const allUsers = await this.getAllPlatformUsers();
    const updated = allUsers.find(u => u.id === id);
    if (!updated) throw new Error('User not found after update');
    return updated;
  },
};
