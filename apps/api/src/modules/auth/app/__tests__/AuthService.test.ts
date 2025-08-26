import { AuthService } from '../AuthService.js';
import supabaseAdmin from '../../../../config/supabase.js';
import { AppError } from '../../../../shared/errors/AppError.js';

// Mock Supabase
jest.mock('../../../../config/supabase.js', () => ({
  default: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn()
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should create a new user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };

      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        user_gender: 'male',
        partner_gender: 'female',
        interests: [],
        created_at: new Date().toISOString()
      };

      (supabaseAdmin.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token123' } },
        error: null
      });

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null
            })
          })
        })
      });

      const result = await authService.signUp({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        userGender: 'male',
        partnerGender: 'female'
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('session');
      expect(result.user.email).toBe('test@example.com');
      expect(supabaseAdmin.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should throw error if email already exists', async () => {
      (supabaseAdmin.auth.signUp as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'User already registered', status: 400 }
      });

      await expect(authService.signUp({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
        userGender: 'male',
        partnerGender: 'female'
      })).rejects.toThrow(AppError);
    });

    it('should handle profile creation failure', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };

      (supabaseAdmin.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token123' } },
        error: null
      });

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Profile creation failed' }
            })
          })
        })
      });

      await expect(authService.signUp({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        userGender: 'male',
        partnerGender: 'female'
      })).rejects.toThrow('프로필 생성에 실패했습니다');
    });
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };

      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      };

      (supabaseAdmin.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token123' } },
        error: null
      });

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null
            })
          })
        })
      });

      const result = await authService.signIn('test@example.com', 'password123');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('session');
      expect(result.user.email).toBe('test@example.com');
      expect(supabaseAdmin.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should throw error for invalid credentials', async () => {
      (supabaseAdmin.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials', status: 400 }
      });

      await expect(authService.signIn('test@example.com', 'wrongpassword'))
        .rejects.toThrow('이메일 또는 비밀번호가 올바르지 않습니다');
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      (supabaseAdmin.auth.signOut as jest.Mock).mockResolvedValue({
        error: null
      });

      await expect(authService.signOut()).resolves.not.toThrow();
      expect(supabaseAdmin.auth.signOut).toHaveBeenCalled();
    });

    it('should handle sign out error', async () => {
      (supabaseAdmin.auth.signOut as jest.Mock).mockResolvedValue({
        error: { message: 'Sign out failed' }
      });

      await expect(authService.signOut())
        .rejects.toThrow('로그아웃에 실패했습니다');
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };

      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      };

      (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null
            })
          })
        })
      });

      const result = await authService.getCurrentUser('token123');

      expect(result).toEqual(mockProfile);
      expect(supabaseAdmin.auth.getUser).toHaveBeenCalledWith('token123');
    });

    it('should return null if no user is authenticated', async () => {
      (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null
      });

      const result = await authService.getCurrentUser('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      (supabaseAdmin.auth.updateUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      });

      await expect(authService.updatePassword('user-123', 'newPassword123'))
        .resolves.not.toThrow();
    });

    it('should handle password update error', async () => {
      (supabaseAdmin.auth.updateUser as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Password update failed' }
      });

      await expect(authService.updatePassword('user-123', 'newPassword123'))
        .rejects.toThrow('비밀번호 변경에 실패했습니다');
    });
  });
});