import { supabaseAdmin } from '../../../shared/infra/supabase.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { UserProfile } from '@qupid/core';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  name: string;
  user_gender: 'male' | 'female';
  partner_gender: 'male' | 'female';
}

export interface AuthResponse {
  user: any;
  session: any;
  profile?: UserProfile;
}

export class AuthService {
  /**
   * 회원가입
   */
  async signup(data: SignupData): Promise<AuthResponse> {
    // 1. Admin API를 사용하여 사용자 생성 (이메일 확인 건너뛰기)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // 이메일 자동 확인
      user_metadata: {
        name: data.name,
        user_gender: data.user_gender,
        partner_gender: data.partner_gender
      }
    });

    if (authError) {
      throw AppError.badRequest(authError.message);
    }

    if (!authData.user) {
      throw AppError.internal('Failed to create user');
    }

    // 2. users 테이블에 프로필 생성
    const { data: profile, error: profileError } = await (supabaseAdmin as any)
      .from('users')
      .insert({
        id: authData.user.id,
        name: data.name,
        user_gender: data.user_gender,
        partner_gender: data.partner_gender,
        experience: '없음',
        confidence: 3,
        difficulty: 2,
        interests: [],
        is_tutorial_completed: false
      })
      .select()
      .single();

    if (profileError) {
      // Auth 사용자는 생성되었지만 프로필 생성 실패
      console.error('Profile creation failed:', profileError);
      // 나중에 프로필을 다시 생성할 수 있도록 Auth 사용자는 유지
    }

    // 3. 자동 로그인을 위해 세션 생성
    const { data: loginData, error: loginError } = await supabaseAdmin.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });

    return {
      user: authData.user,
      session: loginData?.session || null,
      profile: profile || undefined
    };
  }

  /**
   * 로그인
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });

    if (error) {
      throw AppError.unauthorized('Invalid email or password');
    }

    if (!data.user) {
      throw AppError.internal('Login failed');
    }

    // 사용자 프로필 조회
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      user: data.user,
      session: data.session,
      profile: profile || undefined
    };
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    const { error } = await supabaseAdmin.auth.signOut();
    
    if (error) {
      throw AppError.internal('Logout failed');
    }
  }

  /**
   * 현재 세션 확인
   */
  async getSession(): Promise<AuthResponse | null> {
    const { data: { session }, error } = await supabaseAdmin.auth.getSession();
    
    if (error || !session) {
      return null;
    }

    const { data: { user } } = await supabaseAdmin.auth.getUser();
    
    if (!user) {
      return null;
    }

    // 사용자 프로필 조회
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      user,
      session,
      profile: profile || undefined
    };
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) {
      throw AppError.unauthorized('Token refresh failed');
    }

    if (!data.user || !data.session) {
      throw AppError.unauthorized('Invalid refresh token');
    }

    // 사용자 프로필 조회
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      user: data.user,
      session: data.session,
      profile: profile || undefined
    };
  }

  /**
   * 비밀번호 재설정 이메일 발송
   */
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    if (error) {
      throw AppError.internal('Failed to send reset email');
    }
  }

  /**
   * 비밀번호 업데이트
   */
  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabaseAdmin.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw AppError.internal('Failed to update password');
    }
  }
}