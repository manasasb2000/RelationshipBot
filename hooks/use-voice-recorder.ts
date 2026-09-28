'use client';
import { useRef, useState } from 'react';

export function useVoiceRecorder(onRecording: (blob: Blob) => Promise<void>) {
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');

  async function toggle() {
    if (recording) {
      recorder.current?.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Voice recording is not supported in this browser.');
      return;
    }
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferred = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((type) =>
        MediaRecorder.isTypeSupported(type),
      );
      const mediaRecorder = new MediaRecorder(
        stream.current,
        preferred ? { mimeType: preferred } : undefined,
      );
      recorder.current = mediaRecorder;
      chunks.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size) chunks.current.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        setRecording(false);
        stream.current?.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunks.current, { type: mediaRecorder.mimeType });
        if (blob.size) await onRecording(blob);
      };
      mediaRecorder.start();
      setRecording(true);
      setError('');
    } catch {
      setError('Microphone access was denied. You can continue by typing.');
    }
  }

  return { recording, error, toggle };
}
