"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import OceanTrash from "./OceanTrash";
import { BEST_SCORE_KEY, GAME_DURATION, GAME_IMAGES, MAX_TRASH, STARTING_LIVES, TRASH_TYPES } from "./oceanCleanupData";
import styles from "./OceanCleanupGame.module.css";

function createTrashCandidate(id) {
  const source = TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)];
  const side = Math.floor(Math.random() * 3);
  const size = 58 + Math.random() * 34;
  const speed = 42 + Math.random() * 45;
  if (side === 0) return { ...source, id, size, x: -size, y: 100 + Math.random() * (window.innerHeight - 260), vx: speed, vy: (Math.random() - .5) * 18, rotation: Math.random() * 80, rotationSpeed: (Math.random() - .5) * 35, phase: Math.random() * 6 };
  if (side === 1) return { ...source, id, size, x: window.innerWidth + size, y: 100 + Math.random() * (window.innerHeight - 260), vx: -speed, vy: (Math.random() - .5) * 18, rotation: Math.random() * 80, rotationSpeed: (Math.random() - .5) * 35, phase: Math.random() * 6 };
  return { ...source, id, size, x: 40 + Math.random() * (window.innerWidth - 120), y: -size, vx: (Math.random() - .5) * 28, vy: speed, rotation: Math.random() * 80, rotationSpeed: (Math.random() - .5) * 35, phase: Math.random() * 6 };
}

function createTrash(id, existing) {
  let candidate = createTrashCandidate(id);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const overlaps = existing.some((item) => Math.hypot(item.x - candidate.x, item.y - candidate.y) < 140);
    if (!overlaps) return candidate;
    candidate = createTrashCandidate(id);
  }
  return candidate;
}

export default function OceanCleanupGame({ onClose }) {
  const binRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const reactionTimerRef = useRef(null);
  const particleTimerRef = useRef(null);
  const nextIdRef = useRef(1);
  const scoreRef = useRef(0);
  const livesRef = useRef(STARTING_LIVES);
  const timeLeftRef = useRef(GAME_DURATION);
  const [phase, setPhase] = useState("countdown");
  const [countdown, setCountdown] = useState("3");
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [trash, setTrash] = useState([]);
  const [reaction, setReaction] = useState("ready");
  const [particle, setParticle] = useState(null);
  const [bestScore, setBestScore] = useState(() => {
    if (typeof window === "undefined") return 0;
    const stored = Number(window.localStorage.getItem(BEST_SCORE_KEY) || 0);
    return Number.isFinite(stored) ? stored : 0;
  });

  const finishGame = useCallback(() => {
    setTrash([]);
    setPhase((current) => current === "result" ? current : "result");
    setBestScore((current) => {
      const next = Math.max(current, scoreRef.current);
      window.localStorage.setItem(BEST_SCORE_KEY, String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(spawnTimerRef.current);
      window.clearTimeout(reactionTimerRef.current);
      window.clearTimeout(particleTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== "countdown") return undefined;
    const values = ["3", "2", "1", "START!"];
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      if (index >= values.length) {
        window.clearInterval(timer);
        setPhase("playing");
        return;
      }
      setCountdown(values[index]);
    }, 800);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return undefined;
    const timer = window.setInterval(() => setTimeLeft((value) => {
      if (value <= 1) {
        window.clearInterval(timer);
        timeLeftRef.current = 0;
        finishGame();
        return 0;
      }
      const next = value - 1;
      timeLeftRef.current = next;
      return next;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [finishGame, phase]);

  useEffect(() => {
    if (phase !== "playing") return undefined;
    let cancelled = false;
    const schedule = () => {
      const progress = 1 - timeLeftRef.current / GAME_DURATION;
      const delay = 1250 - progress * 520 + Math.random() * 550;
      spawnTimerRef.current = window.setTimeout(() => {
        if (cancelled) return;
        setTrash((items) => items.length >= MAX_TRASH ? items : [...items, createTrash(nextIdRef.current++, items)]);
        schedule();
      }, delay);
    };
    schedule();
    return () => {
      cancelled = true;
      window.clearTimeout(spawnTimerRef.current);
    };
  }, [phase]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (phase === "result") onClose();
      else finishGame();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [finishGame, onClose, phase]);

  const react = useCallback((next) => {
    window.clearTimeout(reactionTimerRef.current);
    setReaction(next);
    reactionTimerRef.current = window.setTimeout(() => setReaction("ready"), 1000);
  }, []);

  const collect = useCallback((item) => {
    setTrash((items) => items.filter((candidate) => candidate.id !== item.id));
    setCombo((current) => {
      const next = current + 1;
      const bonus = next >= 3 ? Math.min(2, 1 + (next - 2) * .1) : 1;
      setScore((value) => {
        const nextScore = value + Math.round(item.score * bonus);
        scoreRef.current = nextScore;
        return nextScore;
      });
      return next;
    });
    const rect = binRef.current?.getBoundingClientRect();
    window.clearTimeout(particleTimerRef.current);
    setParticle({ id: `${item.id}-${Date.now()}`, left: rect?.left ?? 0, top: rect?.top ?? 0 });
    particleTimerRef.current = window.setTimeout(() => setParticle(null), 900);
    react("success");
  }, [react]);

  const miss = useCallback((id) => {
    setTrash((items) => items.filter((item) => item.id !== id));
    setCombo(0);
    const nextLives = Math.max(0, livesRef.current - 1);
    livesRef.current = nextLives;
    setLives(nextLives);
    if (nextLives === 0) finishGame();
    react("missed");
  }, [finishGame, react]);

  const restart = () => {
    window.clearTimeout(spawnTimerRef.current);
    setTrash([]);
    setScore(0);
    scoreRef.current = 0;
    setCombo(0);
    setLives(STARTING_LIVES);
    livesRef.current = STARTING_LIVES;
    setTimeLeft(GAME_DURATION);
    timeLeftRef.current = GAME_DURATION;
    setReaction("ready");
    setParticle(null);
    setCountdown("3");
    setPhase("countdown");
  };

  const reactionImage = reaction === "success" ? GAME_IMAGES.success : reaction === "missed" ? GAME_IMAGES.missed : GAME_IMAGES.ready;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="호키의 바다 정화 작전">
      <div className={styles.waves} aria-hidden="true" />
      <div className={styles.hud}>
        <div><small>점수</small><strong>{score.toLocaleString()}</strong></div>
        <div><small>최고 점수</small><strong>{bestScore.toLocaleString()}</strong></div>
        <div><small>남은 시간</small><strong>{timeLeft}초</strong></div>
        <div><small>기회</small><strong aria-label={`남은 기회 ${lives}개`}>{"💙".repeat(lives)}{"♡".repeat(STARTING_LIVES - lives)}</strong></div>
        <div><small>콤보</small><strong>{combo} COMBO</strong></div>
        <button type="button" onClick={finishGame} aria-label="바다 정화 게임 종료">게임 종료</button>
      </div>

      {phase === "playing" && trash.map((item) => <OceanTrash key={item.id} item={item} binRef={binRef} onCollected={collect} onMissed={miss} />)}

      <div className={styles.hoki}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={reaction} src={reactionImage} alt="바다 정화 작전 중인 호키" draggable="false" />
      </div>
      <div ref={binRef} className={styles.bin} aria-label="해양 쓰레기 수거함">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={GAME_IMAGES.bin} alt="해양 쓰레기 수거함" draggable="false" />
      </div>
      {particle && (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={particle.id} className={styles.particles} src={GAME_IMAGES.particles} alt="" aria-hidden="true" style={{ left: particle.left, top: particle.top }} />
      )}
      {phase === "countdown" && <div className={styles.countdown} aria-live="assertive">{countdown}</div>}
      {phase === "result" && (
        <div className={styles.resultBackdrop}>
          <section className={styles.result} aria-labelledby="cleanup-result-title">
            <span>MISSION COMPLETE</span>
            <h2 id="cleanup-result-title">바다 정화 작전 결과</h2>
            <p>최종 점수 <strong>{score.toLocaleString()}점</strong></p>
            {score >= bestScore && score > 0 && <em>새로운 최고 기록이에요!</em>}
            <div><button type="button" onClick={restart}>다시 하기</button><button type="button" onClick={onClose}>그만하기</button></div>
          </section>
        </div>
      )}
    </div>
  );
}
