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
  private isEnabled: boolean = false;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('SocialAuthService: Supabase configuration is missing. Social login will be disabled.');
      this.isEnabled = false;
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    this.isEnabled = true;
  }

  // 카카오 로그인
  async kakaoLogin(code: string): Promise<any> {
    if (!this.isEnabled) {
      throw AppError.badRequest('소셜 로그인이 비활성화되어 있습니다.');
    }
    
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
      throw AppError.internal('카카오 로그인에 실패했습니다.');
    }
  }

  // 네이버 로그인
  async naverLogin(code: string, state: string): Promise<any> {
    if (!this.isEnabled) {
      throw AppError.badRequest('소셜 로그인이 비활성화되어 있습니다.');
    }
    
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
      throw AppError.internal('네이버 로그인에 실패했습니다.');
    }
  }

  // 구글 로그인
  async googleLogin(code: string): Promise<any> {
    if (!this.isEnabled) {
      throw AppError.badRequest('소셜 로그인이 비활성화되어 있습니다.');
    }
    
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
      throw AppError.internal('구글 로그인에 실패했습니다.');
    }
  }

  // 사용자 생성 또는 업데이트
  private async createOrUpdateUser(userInfo: SocialUserInfo): Promise<any> {
    try {
      // 1. 사용자 프로필 테이블에서 확인/생성
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

      // 2. JWT 토큰 생성 (간단한 구현)
      const token = Buffer.from(JSON.stringify({
        sub: profile.id,
        email: profile.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24시간
      })).toString('base64');

      return {
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
        },
        session: {
          access_token: token,
          refresh_token: token,
        },
        profile,
      };
    } catch (error) {
      console.error('Create or update user error:', error);
      throw AppError.internal('사용자 정보 처리에 실패했습니다.');
    }
  }

  // 소셜 로그인 URL 생성
  getKakaoLoginUrl(): string {
    if (!this.isEnabled || !process.env.KAKAO_CLIENT_ID || !process.env.KAKAO_REDIRECT_URI) {
      return '';
    }
    
    const params = new URLSearchParams({
      client_id: process.env.KAKAO_CLIENT_ID,
      redirect_uri: process.env.KAKAO_REDIRECT_URI,
      response_type: 'code',
    });

    return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  }

  getNaverLoginUrl(): string {
    if (!this.isEnabled || !process.env.NAVER_CLIENT_ID || !process.env.NAVER_REDIRECT_URI) {
      return '';
    }
    
    const state = Math.random().toString(36).substring(2, 15);
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.NAVER_CLIENT_ID,
      redirect_uri: process.env.NAVER_REDIRECT_URI,
      state,
    });

    return `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
  }

  getGoogleLoginUrl(): string {
    if (!this.isEnabled || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URI) {
      return '';
    }
    
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }
}
