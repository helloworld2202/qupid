import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { AppError } from '../../../shared/errors/AppError.js';

interface SocialUserInfo {
  id: string;
  email: string;
  name: string;
  profile_image?: string;
  provider: 'kakao' | 'naver' | 'google';
}

interface KakaoUserInfo {
  id: number;
  kakao_account: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
}

interface NaverUserInfo {
  id: string;
  email: string;
  name: string;
  profile_image?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export class SocialAuthService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  // 카카오 로그인
  async kakaoLogin(code: string): Promise<any> {
    try {
      // 1. 카카오에서 액세스 토큰 받기
      const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', {
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_CLIENT_ID,
        client_secret: process.env.KAKAO_CLIENT_SECRET,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        code,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = tokenResponse.data;

      // 2. 카카오에서 사용자 정보 가져오기
      const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const kakaoUser: KakaoUserInfo = userResponse.data;
      
      // 3. 사용자 정보 정규화
      const userInfo: SocialUserInfo = {
        id: kakaoUser.id.toString(),
        email: kakaoUser.kakao_account.email || '',
        name: kakaoUser.kakao_account.profile?.nickname || '카카오 사용자',
        profile_image: kakaoUser.kakao_account.profile?.profile_image_url,
        provider: 'kakao',
      };

      return await this.createOrUpdateUser(userInfo);
    } catch (error) {
      console.error('Kakao login error:', error);
      throw AppError.internalServerError('카카오 로그인에 실패했습니다.');
    }
  }

  // 네이버 로그인
  async naverLogin(code: string, state: string): Promise<any> {
    try {
      // 1. 네이버에서 액세스 토큰 받기
      const tokenResponse = await axios.post('https://nid.naver.com/oauth2.0/token', {
        grant_type: 'authorization_code',
        client_id: process.env.NAVER_CLIENT_ID,
        client_secret: process.env.NAVER_CLIENT_SECRET,
        redirect_uri: process.env.NAVER_REDIRECT_URI,
        code,
        state,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = tokenResponse.data;

      // 2. 네이버에서 사용자 정보 가져오기
      const userResponse = await axios.get('https://openapi.naver.com/v1/nid/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const naverUser: NaverUserInfo = userResponse.data.response;
      
      // 3. 사용자 정보 정규화
      const userInfo: SocialUserInfo = {
        id: naverUser.id,
        email: naverUser.email,
        name: naverUser.name,
        profile_image: naverUser.profile_image,
        provider: 'naver',
      };

      return await this.createOrUpdateUser(userInfo);
    } catch (error) {
      console.error('Naver login error:', error);
      throw AppError.internalServerError('네이버 로그인에 실패했습니다.');
    }
  }

  // 구글 로그인
  async googleLogin(code: string): Promise<any> {
    try {
      // 1. 구글에서 액세스 토큰 받기
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        grant_type: 'authorization_code',
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        code,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = tokenResponse.data;

      // 2. 구글에서 사용자 정보 가져오기
      const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const googleUser: GoogleUserInfo = userResponse.data;
      
      // 3. 사용자 정보 정규화
      const userInfo: SocialUserInfo = {
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        profile_image: googleUser.picture,
        provider: 'google',
      };

      return await this.createOrUpdateUser(userInfo);
    } catch (error) {
      console.error('Google login error:', error);
      throw AppError.internalServerError('구글 로그인에 실패했습니다.');
    }
  }

  // 사용자 생성 또는 업데이트
  private async createOrUpdateUser(userInfo: SocialUserInfo): Promise<any> {
    try {
      // 1. Supabase Auth에 사용자 생성/로그인
      // Supabase에서 지원하는 Provider 타입으로 변환
      let supabaseProvider: 'google' | 'kakao';
      if (userInfo.provider === 'google') {
        supabaseProvider = 'google';
      } else if (userInfo.provider === 'kakao') {
        supabaseProvider = 'kakao';
      } else {
        // 네이버는 Supabase에서 직접 지원하지 않으므로 구글로 대체
        supabaseProvider = 'google';
      }

      const { data: authData, error: authError } = await this.supabase.auth.signInWithOAuth({
        provider: supabaseProvider,
        options: {
          redirectTo: `${process.env.ALLOWED_ORIGINS?.split(',')[0]}/auth/callback`,
        },
      });

      if (authError) {
        throw authError;
      }

      // 2. 사용자 프로필 테이블에서 확인/생성
      const { data: existingProfile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('email', userInfo.email)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      let profile;
      if (existingProfile) {
        // 기존 사용자 업데이트
        const { data: updatedProfile, error: updateError } = await this.supabase
          .from('user_profiles')
          .update({
            name: userInfo.name,
            profile_image: userInfo.profile_image,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingProfile.id)
          .select()
          .single();

        if (updateError) throw updateError;
        profile = updatedProfile;
      } else {
        // 새 사용자 생성
        const { data: newProfile, error: createError } = await this.supabase
          .from('user_profiles')
          .insert({
            email: userInfo.email,
            name: userInfo.name,
            profile_image: userInfo.profile_image,
            provider: userInfo.provider,
            provider_id: userInfo.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) throw createError;
        profile = newProfile;
      }

      return {
        user: authData.user,
        session: authData.session,
        profile,
      };
    } catch (error) {
      console.error('Create or update user error:', error);
      throw AppError.internalServerError('사용자 정보 처리에 실패했습니다.');
    }
  }

  // 소셜 로그인 URL 생성
  getKakaoLoginUrl(): string {
    const params = new URLSearchParams({
      client_id: process.env.KAKAO_CLIENT_ID || '',
      redirect_uri: process.env.KAKAO_REDIRECT_URI || '',
      response_type: 'code',
    });

    return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  }

  getNaverLoginUrl(): string {
    const state = Math.random().toString(36).substring(2, 15);
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.NAVER_CLIENT_ID || '',
      redirect_uri: process.env.NAVER_REDIRECT_URI || '',
      state,
    });

    return `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
  }

  getGoogleLoginUrl(): string {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || '',
      response_type: 'code',
      scope: 'openid email profile',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }
}
