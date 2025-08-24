import { supabase } from '../../../config/supabase';
import { AppError } from '../../../shared/errors/AppError';
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
    // 1. Supabase Auth에 사용자 생성
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          user_gender: data.user_gender,
          partner_gender: data.partner_gender
        }
      }
    });

    if (authError) {
      throw new AppError(authError.message, 400);
    }

    if (!authData.user) {
      throw new AppError('Failed to create user', 500);
    }

    // 2. users 테이블에 프로필 생성
    const { data: profile, error: profileError } = await supabase
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

    return {
      user: authData.user,
      session: authData.session,
      profile: profile || undefined
    };
  }

  /**
   * 로그인
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });

    if (error) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!data.user) {
      throw new AppError('Login failed', 500);
    }

    // 사용자 프로필 조회
    const { data: profile } = await supabase
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
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new AppError('Logout failed', 500);
    }
  }

  /**
   * 현재 세션 확인
   */
  async getSession(): Promise<AuthResponse | null> {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    // 사용자 프로필 조회
    const { data: profile } = await supabase
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
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) {
      throw new AppError('Token refresh failed', 401);
    }

    if (!data.user || !data.session) {
      throw new AppError('Invalid refresh token', 401);
    }

    // 사용자 프로필 조회
    const { data: profile } = await supabase
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
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    if (error) {
      throw new AppError('Failed to send reset email', 500);
    }
  }

  /**
   * 비밀번호 업데이트
   */
  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw new AppError('Failed to update password', 500);
    }
  }
}