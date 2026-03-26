import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff, RotateCcw, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NoticeBanner } from "@/components/shared/NoticeBanner";

type VoiceTranscriptionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (payload: { file: File | null; transcriptText: string; durationSeconds: number }) => void;
  initialTranscript?: string;
  language?: "en" | "hi";
};

type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  }
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function VoiceTranscriptionDialog({
  open,
  onOpenChange,
  onApply,
  initialTranscript = "",
  language = "en",
}: VoiceTranscriptionDialogProps) {
  const [transcript, setTranscript] = useState(initialTranscript);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const finalTranscriptRef = useRef(initialTranscript);

  const transcriptionSupported = useMemo(
    () => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
    [],
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const releaseMedia = useCallback(() => {
    clearTimer();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, [clearTimer]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // no-op: some browsers throw if stop is called twice
      }
      recognitionRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    stopRecognition();
    releaseMedia();
    setIsRecording(false);
  }, [releaseMedia, stopRecognition]);

  useEffect(() => {
    if (!open) {
      stopRecording();
      setTranscript(initialTranscript);
      finalTranscriptRef.current = initialTranscript;
      setRecordedFile(null);
      setDurationSeconds(0);
      setError("");
      setInfo("");
      return;
    }
    setTranscript(initialTranscript);
    finalTranscriptRef.current = initialTranscript;
    setRecordedFile(null);
    setDurationSeconds(0);
    setError("");
    setInfo(
      transcriptionSupported
        ? "Record a voice note and review the generated transcript before applying it to the FIR."
        : "Voice recording is available, but live browser transcription is not supported here. You can still record and then edit the transcript manually.",
    );
  }, [initialTranscript, open, stopRecording, transcriptionSupported]);

  useEffect(() => () => stopRecording(), [stopRecording]);

  const startRecording = useCallback(async () => {
    setError("");
    setRecordedFile(null);
    finalTranscriptRef.current = transcript.trim();

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("This browser cannot access the microphone. Please upload audio or paste transcript text instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const preferredMimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
      ].find((candidate) => typeof MediaRecorder.isTypeSupported === "function" && MediaRecorder.isTypeSupported(candidate));

      const recorder = preferredMimeType
        ? new MediaRecorder(stream, { mimeType: preferredMimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        if (!chunksRef.current.length) {
          return;
        }
        const mimeType = recorder.mimeType || preferredMimeType || "audio/webm";
        const extension = mimeType.includes("ogg") ? "ogg" : "webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedFile(new File([blob], `fir-voice-note.${extension}`, { type: mimeType }));
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setDurationSeconds(0);
      timerRef.current = window.setInterval(() => {
        setDurationSeconds((value) => value + 1);
      }, 1000);

      const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (RecognitionCtor) {
        const recognition = new RecognitionCtor();
        recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
        recognition.interimResults = true;
        recognition.continuous = true;
        recognition.onresult = (event) => {
          let finalText = finalTranscriptRef.current;
          let interimText = "";
          for (let index = event.resultIndex; index < event.results.length; index += 1) {
            const segment = event.results[index]?.[0]?.transcript ?? "";
            if (event.results[index]?.isFinal) {
              finalText = `${finalText} ${segment}`.trim();
            } else {
              interimText = `${interimText} ${segment}`.trim();
            }
          }
          finalTranscriptRef.current = finalText;
          setTranscript(`${finalText} ${interimText}`.trim());
        };
        recognition.onerror = (event) => {
          if (event?.error === "not-allowed") {
            setError("Microphone access was blocked by the browser. Please allow mic access and try again.");
          } else if (event?.error !== "no-speech" && event?.error !== "aborted") {
            setInfo("Live browser transcription paused. Your recording is still being captured, and you can edit the transcript manually.");
          }
        };
        recognition.onend = () => {
          if (isRecording) {
            setInfo("Recording saved. Review the transcript before applying it to the FIR.");
          }
        };
        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch (caughtError) {
      releaseMedia();
      setIsRecording(false);
      setError(caughtError instanceof Error ? caughtError.message : "Unable to start microphone recording.");
    }
  }, [isRecording, language, releaseMedia, transcript]);

  const handleApply = useCallback(() => {
    onApply({
      file: recordedFile,
      transcriptText: transcript.trim(),
      durationSeconds,
    });
    onOpenChange(false);
  }, [durationSeconds, onApply, onOpenChange, recordedFile, transcript]);

  const handleReset = useCallback(() => {
    stopRecording();
    setTranscript("");
    finalTranscriptRef.current = "";
    setRecordedFile(null);
    setDurationSeconds(0);
    setError("");
    setInfo(
      transcriptionSupported
        ? "Record a fresh voice note and review the transcript before applying it."
        : "Record a fresh voice note, then type or edit the transcript manually before applying it.",
    );
  }, [stopRecording, transcriptionSupported]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <WandSparkles className="h-5 w-5 text-amber-500" />
            FIR voice transcription
          </DialogTitle>
          <DialogDescription>
            Record a voice note, review the transcript, and apply it directly to the FIR voice workflow.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {info ? <NoticeBanner variant="info">{info}</NoticeBanner> : null}
          {error ? <NoticeBanner variant="error">{error}</NoticeBanner> : null}

          <div className="rounded-2xl border bg-slate-950 p-5 text-slate-50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Voice note</p>
                <p className="mt-1 text-2xl font-semibold">{formatDuration(durationSeconds)}</p>
              </div>
              <div className="flex gap-2">
                {!isRecording ? (
                  <Button type="button" onClick={() => void startRecording()} className="bg-rose-500 text-white hover:bg-rose-600">
                    <Mic className="mr-2 h-4 w-4" />
                    Start recording
                  </Button>
                ) : (
                  <Button type="button" variant="secondary" onClick={stopRecording}>
                    <MicOff className="mr-2 h-4 w-4" />
                    Stop recording
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              {isRecording
                ? "Recording is live. Speak clearly and pause once the incident details are complete."
                : recordedFile
                  ? `Voice note attached: ${recordedFile.name}`
                  : "You can record a fresh voice note or keep using manual transcript text."}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-900">Editable transcript</p>
            <Textarea
              value={transcript}
              onChange={(event) => {
                setTranscript(event.target.value);
                finalTranscriptRef.current = event.target.value;
              }}
              rows={9}
              placeholder="Your transcript will appear here. You can edit names, dates, locations, or facts before applying it to the FIR form."
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleApply} disabled={!recordedFile && !transcript.trim()}>
            Apply to FIR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
