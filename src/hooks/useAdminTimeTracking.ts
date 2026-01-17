import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const HEARTBEAT_INTERVAL = 30000; // 30 seconds

export function useAdminTimeTracking(isAdminArea: boolean) {
  const sessionIdRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const startSession = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check for existing active session
      const { data: existingSession } = await supabase
        .from('admin_time_sessions')
        .select('id, start_time')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (existingSession) {
        sessionIdRef.current = existingSession.id;
        startTimeRef.current = new Date(existingSession.start_time);
        return;
      }

      // Create new session
      const { data, error } = await supabase
        .from('admin_time_sessions')
        .insert({
          user_id: user.id,
          session_date: new Date().toISOString().split('T')[0],
          start_time: new Date().toISOString(),
          is_active: true,
        })
        .select('id')
        .single();

      if (error) throw error;
      sessionIdRef.current = data.id;
      startTimeRef.current = new Date();
    } catch (error) {
      console.error('Error starting time session:', error);
    }
  }, []);

  const updateSession = useCallback(async () => {
    if (!sessionIdRef.current || !startTimeRef.current) return;

    try {
      const durationSeconds = Math.floor(
        (new Date().getTime() - startTimeRef.current.getTime()) / 1000
      );

      await supabase
        .from('admin_time_sessions')
        .update({ duration_seconds: durationSeconds })
        .eq('id', sessionIdRef.current);
    } catch (error) {
      console.error('Error updating time session:', error);
    }
  }, []);

  const endSession = useCallback(async () => {
    if (!sessionIdRef.current || !startTimeRef.current) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const endTime = new Date();
      const durationSeconds = Math.floor(
        (endTime.getTime() - startTimeRef.current.getTime()) / 1000
      );

      // Update session as completed
      await supabase
        .from('admin_time_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration_seconds: durationSeconds,
          is_active: false,
        })
        .eq('id', sessionIdRef.current);

      // Aggregate to daily totals
      const sessionDate = startTimeRef.current.toISOString().split('T')[0];
      
      const { data: existingDaily } = await supabase
        .from('admin_time_daily')
        .select('id, total_seconds, session_count')
        .eq('user_id', user.id)
        .eq('date', sessionDate)
        .single();

      if (existingDaily) {
        await supabase
          .from('admin_time_daily')
          .update({
            total_seconds: existingDaily.total_seconds + durationSeconds,
            session_count: existingDaily.session_count + 1,
          })
          .eq('id', existingDaily.id);
      } else {
        await supabase.from('admin_time_daily').insert({
          user_id: user.id,
          date: sessionDate,
          total_seconds: durationSeconds,
          session_count: 1,
        });
      }

      sessionIdRef.current = null;
      startTimeRef.current = null;
    } catch (error) {
      console.error('Error ending time session:', error);
    }
  }, []);

  useEffect(() => {
    if (!isAdminArea) {
      endSession();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    startSession();
    intervalRef.current = setInterval(updateSession, HEARTBEAT_INTERVAL);

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateSession();
      }
    };

    // Handle before unload
    const handleBeforeUnload = () => {
      endSession();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      endSession();
    };
  }, [isAdminArea, startSession, updateSession, endSession]);

  return { sessionId: sessionIdRef.current };
}
