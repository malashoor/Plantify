// Simple stub for smoke test
export const supabase = {
  auth: {
    signUp: () => Promise.resolve({}),
    signIn: () => Promise.resolve({}),
    signOut: () => Promise.resolve({}),
    getUser: () => Promise.resolve({}),
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null }),
  }),
}; 