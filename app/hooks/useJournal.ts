import { useQuery } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';

interface Journal {
    id: string;
    user_id: string;
    title: string;
    content: string;
    photos?: string[];
    comments?: string[];
    created_at: string;
    updated_at: string;
}

export const useJournal = (id: string) => {
    const { data: journal, isLoading } = useQuery({
        queryKey: ['journal', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('journals')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as Journal;
        },
    });

    return {
        journal,
        isLoading,
    };
}; 