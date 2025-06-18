import { renderHook, act } from '@testing-library/react-hooks';
import { useApplyPromotion, useUserPromotions } from '../usePromotions';
import { supabase } from '../../utils/supabase';

// Mock Supabase client
jest.mock('../../utils/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe('useApplyPromotion', () => {
  const mockUser = { id: 'test-user-id' };
  const mockPromotion = {
    id: 'test-promo-id',
    code: 'TEST123',
    type: 'discount',
    value: '10',
    expires_at: null,
    created_by: 'admin-id',
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });
  });

  it('should successfully apply a valid promotion', async () => {
    // Mock Supabase responses
    (supabase.from as jest.Mock).mockImplementation((table) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockPromotion }),
      insert: jest.fn().mockResolvedValue({ error: null }),
    }));

    const { result } = renderHook(() => useApplyPromotion());
    
    let response;
    await act(async () => {
      response = await result.current.applyPromotion('TEST123');
    });

    expect(response).toEqual({
      success: true,
      promotion: mockPromotion,
    });
  });

  it('should handle expired promotions', async () => {
    const expiredPromotion = {
      ...mockPromotion,
      expires_at: '2020-01-01T00:00:00Z',
    };

    (supabase.from as jest.Mock).mockImplementation((table) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: expiredPromotion }),
    }));

    const { result } = renderHook(() => useApplyPromotion());
    
    let response;
    await act(async () => {
      response = await result.current.applyPromotion('TEST123');
    });

    expect(response).toEqual({
      success: false,
      error: 'EXPIRED',
    });
  });
});

describe('useUserPromotions', () => {
  const mockUser = { id: 'test-user-id' };
  const mockUserPromotions = [
    {
      user_id: 'test-user-id',
      promotion_id: 'promo-1',
      applied_at: new Date().toISOString(),
      promotion: {
        id: 'promo-1',
        type: 'premium_access',
        expires_at: null,
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });
  });

  it('should fetch user promotions successfully', async () => {
    (supabase.from as jest.Mock).mockImplementation((table) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockUserPromotions }),
    }));

    const { result } = renderHook(() => useUserPromotions());
    
    await act(async () => {
      await result.current.fetchPromotions();
    });

    expect(result.current.promotions).toEqual(mockUserPromotions);
    expect(result.current.error).toBeNull();
  });

  it('should detect active premium access', async () => {
    const { result } = renderHook(() => useUserPromotions());
    
    act(() => {
      // @ts-ignore - we're setting state directly for testing
      result.current.promotions = mockUserPromotions;
    });

    expect(result.current.hasActivePremium()).toBe(true);
  });
}); 