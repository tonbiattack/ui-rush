"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Question } from "@/lib/questions";

/**
 * 音声回答。Web Speech API が使えるブラウザだけで有効になる。
 * 認識結果は表記ゆれを吸収してから、用語の名称・英語名・読み・別名と比較する。
 */

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

/** 音声認識に対応しているか。SSRではfalse。 */
export function isSpeechSupported(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const speechWindow = window as SpeechWindow;
  return Boolean(speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition);
}

/**
 * 表記ゆれを吸収する。カタカナ・ひらがな・長音・中黒・空白の揺れを落として比較する。
 */
export function normalizeSpoken(input: string): string {
  return input
    .toLowerCase()
    .replace(/[ぁ-ん]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0x60))
    .replace(/[\s・\-ー~〜、。,.!?！？「」『』]/g, "")
    .replace(/[ａ-ｚＡ-Ｚ０-９]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0xfee0),
    );
}

/** 認識結果がその用語を指しているか。名称・英語名・読み・別名のいずれかに一致すれば正解。 */
export function matchesQuestion(spoken: string, question: Question): boolean {
  const heard = normalizeSpoken(spoken);
  if (heard.length === 0) {
    return false;
  }
  const candidates = [
    question.nameJa,
    question.nameEn,
    question.reading,
    ...question.aliases,
  ].map(normalizeSpoken);

  return candidates.some((candidate) => {
    if (!candidate) {
      return false;
    }
    // 短すぎる候補（1文字）は誤認識を招くので、完全一致のみ認める。
    return candidate.length <= 2 ? heard === candidate : heard.includes(candidate);
  });
}

const noopSubscribe = () => () => {};

/** 対応可否はブラウザでしか分からないため、ハイドレーション後にだけtrueへ変わる。 */
function useSpeechSupport(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    isSpeechSupported,
    () => false,
  );
}

export interface UseSpeechResult {
  supported: boolean;
  listening: boolean;
  transcript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
}

export function useSpeech(onResult: (transcript: string) => void): UseSpeechResult {
  const supported = useSpeechSupport();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const callbackRef = useRef(onResult);

  // 最新のコールバックをeffectで同期する（レンダー中にrefを書き換えない）。
  useEffect(() => {
    callbackRef.current = onResult;
  }, [onResult]);

  // 画面を離れるときに認識を止める。
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const start = useCallback(() => {
    if (!isSpeechSupported()) {
      return;
    }
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      return;
    }

    recognitionRef.current?.abort();
    const recognition = new Recognition();
    recognition.lang = "ja-JP";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const heard = event.results[0]?.[0]?.transcript ?? "";
      setTranscript(heard);
      callbackRef.current(heard);
    };
    recognition.onerror = () => {
      setError("音声を認識できませんでした。もう一度試すか、選択肢から答えてください。");
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    setError(null);
    setTranscript("");
    setListening(true);
    try {
      recognition.start();
    } catch {
      setListening(false);
      setError("音声入力を開始できませんでした。選択肢から答えてください。");
    }
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { supported, listening, transcript, error, start, stop };
}
