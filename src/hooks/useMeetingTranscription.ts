import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useMeetingTranscription = () => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startTranscription = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        audioChunksRef.current = [];
      };

      // Record in 15-second chunks for real-time transcription
      mediaRecorder.start();
      setIsTranscribing(true);

      // Set up interval to process chunks
      const intervalId = setInterval(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          audioChunksRef.current = [];
          mediaRecorder.start();
        }
      }, 15000);

      return () => {
        clearInterval(intervalId);
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      console.error('Error starting transcription:', error);
      throw error;
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      // Convert blob to base64 data URL
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      await new Promise((resolve) => {
        reader.onloadend = resolve;
      });

      const audioData = reader.result as string;

      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audioData },
      });

      if (error) throw error;

      if (data?.transcription && data.transcription.trim()) {
        setTranscript(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${data.transcription}`]);
      }
    } catch (error) {
      console.error('Transcription error:', error);
    }
  };

  const stopTranscription = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsTranscribing(false);
  };

  const clearTranscript = () => {
    setTranscript([]);
  };

  return {
    isTranscribing,
    transcript,
    startTranscription,
    stopTranscription,
    clearTranscript,
  };
};
