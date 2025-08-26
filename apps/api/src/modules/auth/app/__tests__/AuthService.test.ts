import { AuthService } from '../AuthService';
import { AppError } from '../../../../shared/errors/AppError';

// Mock Supabase before importing
jest.mock('../../../../shared/infra/supabase');

describe('AuthService', () => {
  let authService: AuthService;
  let mockSupabase: any;

  beforeEach(() => {
    // Create mock structure matching actual implementation
    mockSupabase = {
      auth: {
        admin: {
          createUser: jest.fn()
        },
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
        getUser: jest.fn(),
        getSession: jest.fn()
      },
      from: jest.fn()
    };
    
    // Set up the mock for supabaseAdmin
    require('../../../../shared/infra/supabase').supabaseAdmin = mockSupabase;
    
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };

      mockSupabase.auth.admin.createUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: mockUser,
          session: { access_token: 'token-123' }
        },
        error: null
      });

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
                gender: 'male',
                preferred_gender: 'female',
                interests: ['movies', 'sports']
              },
              error: null
            })
          })
        })
      });

      const result = await authService.signup({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        user_gender: 'male',
        partner_gender: 'female'
      });

      expect(result.user.email).toBe('test@example.com');
      expect(mockSupabase.auth.admin.createUser).toHaveBeenCalled();
    });

    it('should handle signup error', async () => {
      mockSupabase.auth.admin.createUser.mockResolvedValue({
        data: null,
        error: { message: 'Email already exists' }
      });

      await expect(authService.signup({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        user_gender: 'male',
        partner_gender: 'female'
      })).rejects.toThrow(AppError);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        session: { access_token: 'token-123' }
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: mockSession,
        error: null
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
                gender: 'male',
                preferred_gender: 'female',
                interests: ['movies']
              },
              error: null
            })
          })
        })
      });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.session).toBeDefined();
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should handle invalid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' }
      });

      await expect(authService.login({
        email: 'test@example.com',
        password: 'wrongpassword'
      })).rejects.toThrow(AppError);
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null
      });

      await authService.logout();

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle logout error', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Logout failed' }
      });

      await expect(authService.logout()).rejects.toThrow(AppError);
    });
  });

  describe('getSession', () => {
    it('should get current session', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'token-123'
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockSession.user },
        error: null
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'user-123',
                email: 'test@example.com',
                name: 'Test User'
              },
              error: null
            })
          })
        })
      });

      const result = await authService.getSession();

      expect(result.user.id).toBe('user-123');
      expect(mockSupabase.auth.getSession).toHaveBeenCalled();
    });

    it('should return null when no session', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      const result = await authService.getSession();

      expect(result).toBeNull();
    });
  });
});