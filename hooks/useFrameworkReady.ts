import { useEffect, useState } from 'react';

export function useFrameworkReady() {
  const [ready, setReady] = useState(true);
  useEffect(() => {
    // stub: mark ready immediately
    setReady(true);
  }, []);
  return ready;
}
