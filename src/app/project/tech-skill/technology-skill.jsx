"use client";

import React from "react";
import Link from "next/link";

const sections = [
  {
    id: "overview",
    tag: "HAWK-AI TECH STACK",
    title: "기술 스택 및 시스템 아키텍처 개요",
    desc: "AI 기반 해안 폐기물 탐지 및 현장 점검 서비스 HAWK-AI의 전체 기술 생태계입니다.",
    content: (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "16px",
        }}
      >
        {/* 1. Frontend */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "20px" }}>💻</span>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#1e293b",
                margin: 0,
              }}
            >
              1. Frontend
            </h3>
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "#64748b",
              margin: 0,
              lineHeight: "1.5",
            }}
          >
            Next.js (SSR/SSG), Modern CSS (Tailwind), WebRTC 카메라 캡처, AI
            Visualizer & 챗봇 UI
          </p>
        </div>

        {/* 2. Backend & Infra */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "20px" }}>⚡</span>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#1e293b",
                margin: 0,
              }}
            >
              2. Backend & Infra
            </h3>
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "#64748b",
              margin: 0,
              lineHeight: "1.5",
            }}
          >
            Python (FastAPI), Docker 컨테이너화
          </p>
        </div>

        {/* 3. Database & Storage */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "20px" }}>🗄️</span>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#1e293b",
                margin: 0,
              }}
            >
              3. Database & Storage
            </h3>
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "#64748b",
              margin: 0,
              lineHeight: "1.5",
            }}
          >
            PostgreSQL / MySQL (점검이력, 유저), MinIO (원본 및 YOLO BBox
            이미지)
          </p>
        </div>

        {/* 4. AI Model & LLM */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "20px" }}>🤖</span>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#1e293b",
                margin: 0,
              }}
            >
              4. AI Model & LLM
            </h3>
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "#64748b",
              margin: 0,
              lineHeight: "1.5",
            }}
          >
            YOLO (해안 폐기물 객체 탐지) + LLM (실시간 조치 리포팅 & 호키 캐릭터
            챗봇)
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "frontend",
    tag: "01. FRONTEND",
    title: "프론트엔드 (Frontend)",
    desc: "웹사이트의 번들링 구조와 클라이언트 구성 요소 분석에 기반한 프론트엔드 기술입니다.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "4px 10px",
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                fontSize: "11px",
                fontWeight: "700",
                borderRadius: "6px",
                marginBottom: "10px",
              }}
            >
              Framework & Core
            </span>
            <h4
              style={{
                fontSize: "15px",
                fontWeight: "700",
                color: "#1e293b",
                marginBottom: "8px",
              }}
            >
              Next.js (React Framework)
            </h4>
            <ul
              style={{
                margin: 0,
                paddingLeft: "18px",
                fontSize: "13px",
                color: "#475569",
                lineHeight: "1.6",
              }}
            >
              <li>
                HTML 소스 내{" "}
                <code
                  style={{
                    backgroundColor: "#f1f5f9",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    color: "#2563eb",
                  }}
                >
                  _next/static/chunks
                </code>{" "}
                및 이미지 최적화 API 활용
              </li>
              <li>
                Server-Side Rendering (SSR) / Static Site Generation (SSG) 지원
              </li>
            </ul>
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "4px 10px",
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                fontSize: "11px",
                fontWeight: "700",
                borderRadius: "6px",
                marginBottom: "10px",
              }}
            >
              UI & Styling & Media
            </span>
            <h4
              style={{
                fontSize: "15px",
                fontWeight: "700",
                color: "#1e293b",
                marginBottom: "8px",
              }}
            >
              Modern Styling & WebRTC
            </h4>
            <ul
              style={{
                margin: 0,
                paddingLeft: "18px",
                fontSize: "13px",
                color: "#475569",
                lineHeight: "1.6",
              }}
            >
              <li>Tailwind CSS 기반 반응형 레이아웃 구현</li>
              <li>WebRTC / HTML5 MediaDevices API 실시간 카메라 프레임 캡처</li>
            </ul>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "4px 10px",
              backgroundColor: "#eff6ff",
              color: "#2563eb",
              fontSize: "11px",
              fontWeight: "700",
              borderRadius: "6px",
              marginBottom: "12px",
            }}
          >
            주요 기능 컴포넌트
          </span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
            }}
          >
            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #f1f5f9",
                borderRadius: "12px",
                padding: "14px",
              }}
            >
              <strong
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#1e293b",
                  marginBottom: "4px",
                }}
              >
                📷 실시간 촬영 UI
              </strong>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                현장 실시간 촬영 및 이미지 프리뷰
              </p>
            </div>
            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #f1f5f9",
                borderRadius: "12px",
                padding: "14px",
              }}
            >
              <strong
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#1e293b",
                  marginBottom: "4px",
                }}
              >
                🔍 AI Visualizer
              </strong>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                Bounding Box 및 객체 Count 수치화
              </p>
            </div>
            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #f1f5f9",
                borderRadius: "12px",
                padding: "14px",
              }}
            >
              <strong
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#1e293b",
                  marginBottom: "4px",
                }}
              >
                💬 대화형 챗봇 UI
              </strong>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                "호키" 캐릭터 대화형 인터페이스
              </p>
            </div>
            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #f1f5f9",
                borderRadius: "12px",
                padding: "14px",
              }}
            >
              <strong
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#1e293b",
                  marginBottom: "4px",
                }}
              >
                📊 관리자 대시보드
              </strong>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                점검 이력 및 통계 분석 페이지
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "backend",
    tag: "02. BACKEND & INFRASTRUCTURE",
    title: "백엔드 & 인프라 (Backend & Infrastructure)",
    desc: "AI 모델 추론(Inference) 연동 및 데이터를 처리하기 위한 백엔드 스택입니다.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "4px 10px",
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                fontSize: "11px",
                fontWeight: "700",
                borderRadius: "6px",
                marginBottom: "10px",
              }}
            >
              API & Backend Framework
            </span>
            <h4
              style={{
                fontSize: "15px",
                fontWeight: "700",
                color: "#1e293b",
                marginBottom: "8px",
              }}
            >
              Python API Framework (FastAPI)
            </h4>
            <ul
              style={{
                margin: 0,
                paddingLeft: "18px",
                fontSize: "13px",
                color: "#475569",
                lineHeight: "1.6",
              }}
            >
              <li>PyTorch/YOLO 모델 및 LLM API 연동 최적화</li>
              <li>실시간 이미지 수신 및 비동기 추론 연동</li>
            </ul>
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "4px 10px",
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                fontSize: "11px",
                fontWeight: "700",
                borderRadius: "6px",
                marginBottom: "10px",
              }}
            >
              Infra & Container
            </span>
            <h4
              style={{
                fontSize: "15px",
                fontWeight: "700",
                color: "#1e293b",
                marginBottom: "8px",
              }}
            >
              Docker 컨테이너화
            </h4>
            <ul
              style={{
                margin: 0,
                paddingLeft: "18px",
                fontSize: "13px",
                color: "#475569",
                lineHeight: "1.6",
              }}
            >
              <li>AI 모델 추론 환경 및 웹 서비스 독립 컨테이너화</li>
              <li>동일 환경 구축 및 배포 편의성 제공</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "database",
    tag: "03. DATABASE & STORAGE",
    title: "데이터베이스 & 스토리지 (Database & Storage)",
    desc: "점검 이력, 이미지 저장, AI 분석 결과 및 데이터 관리를 위한 저장소 구성입니다.",
    content: (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "16px",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              paddingBottom: "12px",
              borderBottom: "1px solid #f1f5f9",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "28px" }}>🗄️</span>
            <div>
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#1e293b",
                  margin: 0,
                }}
              >
                RDBMS (관계형 데이터베이스)
              </h3>
              <span
                style={{
                  fontSize: "12px",
                  color: "#2563eb",
                  fontWeight: "600",
                }}
              >
                PostgreSQL / MySQL
              </span>
            </div>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div>
              <h4
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#334155",
                  margin: "0 0 4px 0",
                }}
              >
                📌 점검 이력 데이터
              </h4>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                점검 일시, 점검 장소, 탐지된 폐기물 종류/개수, 조치 상태 관리
              </p>
            </div>
            <div>
              <h4
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#334155",
                  margin: "0 0 4px 0",
                }}
              >
                📌 유저 & 챗봇 데이터
              </h4>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                회원 정보, 게시판 글 및 챗봇 대화 기록
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              paddingBottom: "12px",
              borderBottom: "1px solid #f1f5f9",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "28px" }}>☁️</span>
            <div>
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#1e293b",
                  margin: 0,
                }}
              >
                Object Storage
              </h3>
              <span
                style={{
                  fontSize: "12px",
                  color: "#2563eb",
                  fontWeight: "600",
                }}
              >
                MinIO (S3 Compatible)
              </span>
            </div>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div>
              <h4
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#334155",
                  margin: "0 0 4px 0",
                }}
              >
                📸 원본 현장 사진
              </h4>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                현장 점검 시 촬영된 고해상도 원본 사진 보관
              </p>
            </div>
            <div>
              <h4
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#334155",
                  margin: "0 0 4px 0",
                }}
              >
                🎯 YOLO 탐지 결과 이미지
              </h4>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                Bounding Box 및 라벨이 표시된 AI 추론 이미지 저장
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "ai",
    tag: "04. AI MODEL & LLM",
    title: "AI 기술 스택 (AI Model & LLM)",
    desc: "객체 탐지(Computer Vision)와 자동 리포트 작성(LLM) 핵심 구조입니다.",
    content: (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "16px",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              paddingBottom: "12px",
              borderBottom: "1px solid #f1f5f9",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "28px" }}>👁️</span>
            <div>
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#1e293b",
                  margin: 0,
                }}
              >
                Computer Vision
              </h3>
              <span
                style={{
                  fontSize: "12px",
                  color: "#2563eb",
                  fontWeight: "600",
                }}
              >
                Model: YOLO
              </span>
            </div>
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: "18px",
              fontSize: "13px",
              color: "#475569",
              lineHeight: "1.7",
            }}
          >
            <li>
              <strong>역할:</strong> 캡처 사진에서 해안 폐기물 위치(Bounding
              Box) 탐지
            </li>
            <li>
              <strong>대상:</strong> PET병, 로프, 부표, 스티로폼 등
            </li>
            <li>
              <strong>자동 카운팅:</strong> 폐기물 종류 및 수량 집계
            </li>
          </ul>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              paddingBottom: "12px",
              borderBottom: "1px solid #f1f5f9",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "28px" }}>🧠</span>
            <div>
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#1e293b",
                  margin: 0,
                }}
              >
                LLM & NLP
              </h3>
              <span
                style={{
                  fontSize: "12px",
                  color: "#2563eb",
                  fontWeight: "600",
                }}
              >
                Model: LLM API
              </span>
            </div>
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: "18px",
              fontSize: "13px",
              color: "#475569",
              lineHeight: "1.7",
            }}
          >
            <li>
              <strong>AI 점검 의견:</strong> 탐지 데이터를 기반으로 실시간 조치
              리포트 작성
            </li>
            <li>
              <strong>인터랙티브 챗봇:</strong> 캐릭터 "호키"를 통한 대화형
              서비스
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "summary",
    tag: "SERVICE HIGHLIGHTS",
    title: "💡 서비스 특징 요약",
    desc: "현장 점검자 맞춤형 AI 워크플로우를 완성합니다.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "16px",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#1d4ed8",
              margin: "0 0 8px 0",
            }}
          >
            현장 맞춤형 원스톱 AI 점검 서비스
          </h3>
          <p
            style={{
              fontSize: "13px",
              color: "#334155",
              margin: 0,
              lineHeight: "1.6",
            }}
          >
            단순 실시간 CCTV 감시가 아닌, 현장 점검자가{" "}
            <strong>
              "필요한 순간 사진 1장을 캡처하여 AI 분석 - LLM 리포팅 - 이력 저장"
            </strong>
            까지 한 번에 처리하는 현장 맞춤형 점검 서비스입니다.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: "800",
                color: "#2563eb",
                marginBottom: "4px",
              }}
            >
              STEP 01
            </div>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#1e293b",
                margin: "0 0 4px 0",
              }}
            >
              1장 캡처
            </h4>
            <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
              카메라 현장 촬영
            </p>
          </div>
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: "800",
                color: "#2563eb",
                marginBottom: "4px",
              }}
            >
              STEP 02
            </div>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#1e293b",
                margin: "0 0 4px 0",
              }}
            >
              YOLO AI 탐지
            </h4>
            <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
              폐기물 위치 및 수량 분석
            </p>
          </div>
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: "800",
                color: "#2563eb",
                marginBottom: "4px",
              }}
            >
              STEP 03
            </div>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#1e293b",
                margin: "0 0 4px 0",
              }}
            >
              LLM 리포트
            </h4>
            <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
              조치 의견 자동 생성
            </p>
          </div>
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: "800",
                color: "#2563eb",
                marginBottom: "4px",
              }}
            >
              STEP 04
            </div>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#1e293b",
                margin: "0 0 4px 0",
              }}
            >
              이력 DB 저장
            </h4>
            <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
              위치, 이미지 및 이력 관리
            </p>
          </div>
        </div>
      </div>
    ),
  },
];

export default function TechnologySkill() {
  return (
    /* maxWidth를 1200px 및 w-full 설정으로 공통페이지 레이아웃 정렬 */
    <main
      style={{
        maxWidth: "1200px",
        width: "100%",
        margin: "0 auto",
        padding: "32px 24px 64px 24px",
        boxSizing: "border-box",
      }}
    >
      {/* 상단 헤더 영역 */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "20px",
          marginBottom: "32px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "800",
              color: "#2563eb",
              letterSpacing: "1px",
            }}
          >
            TECH STACK ARCHITECTURE
          </span>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "800",
              color: "#0f172a",
              margin: "4px 0 0 0",
            }}
          >
            HAWK-AI 기술 스택
          </h1>
        </div>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "8px 18px",
            backgroundColor: "#1e3a8a", // 기존 #0f172a(검정) -> #1e3a8a(남색/딥블루)
            color: "#ffffff",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: "700",
            textDecoration: "none",
            boxShadow: "0 2px 4px rgba(30, 58, 138, 0.2)",
            transition: "background-color 0.2s ease",
          }}
        >
          홈으로
        </Link>
      </header>

      {/* 세로 스크롤 카드 섹션들 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {sections.map((section) => (
          <section
            key={section.id}
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              padding: "32px",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  color: "#2563eb",
                  letterSpacing: "1px",
                }}
              >
                {section.tag}
              </span>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "800",
                  color: "#1e293b",
                  margin: "4px 0 4px 0",
                }}
              >
                {section.title}
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                {section.desc}
              </p>
            </div>
            <div>{section.content}</div>
          </section>
        ))}
      </div>
    </main>
  );
}
