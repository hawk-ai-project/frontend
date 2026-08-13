import Workbook from "exceljs";

const createQuickChartUrl = (chartConfig, width = 600, height = 350) => {
  const baseUrl = "https://quickchart.io/chart";
  const params = new URLSearchParams({
    c: JSON.stringify(chartConfig),
    w: width.toString(),
    h: height.toString(),
    bkg: "white",
    devicePixelRatio: "2",
  });
  return `${baseUrl}?${params.toString()}`;
};

export const exportAnalyticsToExcel = async (data, query) => {
  if (!data) {
    alert("내보낼 통계 데이터가 없습니다.");
    return;
  }

  // ==========================================
  // 1. AnalyticsCharts.jsx 와 100% 동일한 데이터 정제
  // ==========================================

  // (1) 기간별 추이 데이터 정제 및 Peak 바 색상 계산
  const trends = data.dailyStats || data.trends || [];
  const maxCount = Math.max(
    ...trends.map((item) => Number(item.count ?? 0)),
    0,
  );

  const barLabels = trends.map((item) => item.date || "");
  const barData = trends.map((item) => Number(item.count ?? 0));
  const barColors = trends.map((item) => {
    const val = Number(item.count ?? 0);
    const isPeak = maxCount > 0 && val === maxCount;
    const isWarning = item.isWarning || item.isHighlight;
    return isPeak || isWarning ? "#ec4899" : "#6366f1"; // Peak/Warning이면 핑크, 아니면 보라
  });

  // (2) 폐기물 분포 데이터 정제 및 총 탐지량 계산
  const rawDistribution = data.wasteDistribution || data.distribution || [];
  const normalizedDistribution = rawDistribution.map((item) => {
    const value = Number(
      item.value ?? item.count ?? item.cnt ?? item.total ?? 0,
    );
    const name =
      item.name ?? item.label ?? item.wasteType ?? item.waste_type ?? "기타";
    return { ...item, name, value };
  });

  const totalWaste = normalizedDistribution.reduce(
    (sum, item) => sum + item.value,
    0,
  );
  const doughnutLabels = normalizedDistribution.map((item) => item.name);
  const doughnutData = normalizedDistribution.map((item) => item.value);

  // ==========================================
  // 2. ExcelJS 워크북 생성 및 인쇄 설정
  // ==========================================
  const workbook = new Workbook.Workbook();
  const worksheet = workbook.addWorksheet("통계 분석 보고서");

  worksheet.pageSetup = {
    paperSize: 9,
    orientation: "landscape",
    printArea: "A1:H29",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 1,
    horizontalCentered: true,
    margins: {
      left: 0.4,
      right: 0.4,
      top: 0.5,
      bottom: 0.5,
      header: 0.3,
      footer: 0.3,
    },
  };

  const thinBorder = {
    top: { style: "thin", color: { argb: "CBD5E1" } },
    left: { style: "thin", color: { argb: "CBD5E1" } },
    bottom: { style: "thin", color: { argb: "CBD5E1" } },
    right: { style: "thin", color: { argb: "CBD5E1" } },
  };

  worksheet.columns = Array(8).fill({ width: 15.5 });

  // 타이틀
  worksheet.mergeCells("A1:H1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "통계 분석 보고서";
  titleCell.font = {
    name: "Pretendard",
    size: 18,
    bold: true,
    color: { argb: "0F172A" },
  };

  worksheet.mergeCells("A2:H2");
  const subTitleCell = worksheet.getCell("A2");
  subTitleCell.value = `조회 기간 : ${query?.startDate || ""} ~ ${query?.endDate || ""}`;
  subTitleCell.font = {
    name: "Pretendard",
    size: 11,
    color: { argb: "64748B" },
  };

  worksheet.addRow([]);

  // 표 헤더
  const headerRowIndex = 4;
  const cellPairs = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H"],
  ];
  cellPairs.forEach((pair) =>
    worksheet.mergeCells(
      `${pair[0]}${headerRowIndex}:${pair[1]}${headerRowIndex}`,
    ),
  );

  worksheet.getCell(`A${headerRowIndex}`).value = "지표명";
  worksheet.getCell(`C${headerRowIndex}`).value = "수치";
  worksheet.getCell(`E${headerRowIndex}`).value = "비고";
  worksheet.getCell(`G${headerRowIndex}`).value = "상태";

  const headerRow = worksheet.getRow(headerRowIndex);
  headerRow.height = 28;

  const applyMergedBorder = (startCol, endCol, rowIdx) => {
    const cols = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const start = cols.indexOf(startCol);
    const end = cols.indexOf(endCol);
    for (let i = start; i <= end; i++) {
      worksheet.getCell(`${cols[i]}${rowIdx}`).border = thinBorder;
    }
  };

  ["A", "C", "E", "G"].forEach((col) => {
    const cell = worksheet.getCell(`${col}${headerRowIndex}`);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "1E3B70" },
    };
    cell.font = {
      name: "Pretendard",
      size: 11,
      bold: true,
      color: { argb: "FFFFFF" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  cellPairs.forEach((pair) =>
    applyMergedBorder(pair[0], pair[1], headerRowIndex),
  );

  // 표 데이터 행
  const summaryRowsData = [
    [
      "기간 내 점검",
      `${data.summary?.totalInspections || 0}건`,
      `일평균 ${data.summary?.dailyAvgInspections || 0}건`,
      "정상",
    ],
    [
      "탐지 폐기물",
      `${data.summary?.totalDetections || 0}개`,
      `전주 대비 ${data.summary?.detectionChange || "0%"}`,
      "증가",
    ],
    [
      "최다 탐지 항목",
      data.summary?.topDetectedItem?.name || "-",
      `${data.summary?.topDetectedItem?.count || 0}개`,
      "주의",
    ],
    [
      "처리 완료율",
      `${data.summary?.resolutionRate || 0}%`,
      `${data.summary?.resolvedCount || 0}건 완료`,
      "양호",
    ],
  ];

  summaryRowsData.forEach((rowData, idx) => {
    const currentRowIdx = 5 + idx;
    cellPairs.forEach((pair) =>
      worksheet.mergeCells(
        `${pair[0]}${currentRowIdx}:${pair[1]}${currentRowIdx}`,
      ),
    );

    worksheet.getCell(`A${currentRowIdx}`).value = rowData[0];
    worksheet.getCell(`C${currentRowIdx}`).value = rowData[1];
    worksheet.getCell(`E${currentRowIdx}`).value = rowData[2];
    worksheet.getCell(`G${currentRowIdx}`).value = rowData[3];

    const row = worksheet.getRow(currentRowIdx);
    row.height = 24;

    cellPairs.forEach((pair, colIdx) => {
      const cell = worksheet.getCell(`${pair[0]}${currentRowIdx}`);
      cell.font = { name: "Pretendard", size: 10, color: { argb: "1E293B" } };
      cell.alignment = {
        vertical: "middle",
        horizontal: colIdx === 0 ? "left" : "center",
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F8FAFC" },
      };
      applyMergedBorder(pair[0], pair[1], currentRowIdx);
    });
  });

  // ==========================================
  // 3. QuickChart API 차트 생성
  // ==========================================

  // 막대 차트
  const barChartConfig = {
    type: "bar",
    data: {
      labels: barLabels,
      datasets: [
        {
          label: "탐지 건수",
          data: barData,
          backgroundColor: barColors,
          borderRadius: 6,
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: "기간별 탐지 추이",
        fontSize: 16,
        fontColor: "#0f172a",
      },
      legend: { display: false },
      plugins: {
        datalabels: {
          display: true,
          anchor: "end",
          align: "end",
          color: "#475569",
          font: { weight: "bold", size: 11 },
          formatter: (val) => `${val}건`,
        },
      },
      scales: {
        yAxes: [{ ticks: { beginAtZero: true, stepSize: 2 } }],
      },
    },
  };

  // 도넛 차트 (AnalyticsCharts의 COLORS 및 중앙 라벨 동일 적용)
  const doughnutChartConfig = {
    type: "doughnut",
    data: {
      labels: doughnutLabels,
      datasets: [
        {
          data: doughnutData,
          backgroundColor: [
            "#8b5cf6",
            "#38bdf8",
            "#2563eb",
            "#3b82f6",
            "#6366f1",
            "#ec4899",
          ],
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: "폐기물 분포",
        fontSize: 16,
        fontColor: "#0f172a",
      },
      legend: { position: "right", labels: { boxWidth: 12, fontSize: 11 } },
      plugins: {
        // AnalyticsCharts.jsx 의 renderCenterLabel과 동일하게 표출
        doughnutlabel: {
          labels: [
            {
              text: "총 탐지량",
              font: { size: 12, weight: "bold" },
              color: "#64748b",
            },
            {
              text: `${totalWaste}개`,
              font: { size: 18, weight: "bold" },
              color: "#0f172a",
            },
          ],
        },
        datalabels: {
          display: true,
          color: "#ffffff",
          font: { weight: "bold", size: 11 },
          formatter: (val) => `${val}개`,
        },
      },
    },
  };

  try {
    const barChartUrl = createQuickChartUrl(barChartConfig, 600, 350);
    const doughnutChartUrl = createQuickChartUrl(doughnutChartConfig, 600, 350);

    const [barBlob, doughnutBlob] = await Promise.all([
      fetch(barChartUrl).then((res) => res.arrayBuffer()),
      fetch(doughnutChartUrl).then((res) => res.arrayBuffer()),
    ]);

    const barImageId = workbook.addImage({ buffer: barBlob, extension: "png" });
    const doughnutImageId = workbook.addImage({
      buffer: doughnutBlob,
      extension: "png",
    });

    const chartStartRow = 10;
    worksheet.addImage(barImageId, {
      tl: { col: 0, row: chartStartRow },
      ext: { width: 450, height: 260 },
    });
    worksheet.addImage(doughnutImageId, {
      tl: { col: 4, row: chartStartRow },
      ext: { width: 450, height: 260 },
    });
  } catch (err) {
    console.error("QuickChart 이미지 생성 중 오류 발생:", err);
  }

  // ==========================================
  // 4. 인사이트 영역 (객체/문자열/배열 구조 모두 대응)
  // ==========================================
  const insightHeaderRow = 25;
  worksheet.mergeCells(`A${insightHeaderRow}:H${insightHeaderRow}`);
  const insightHeaderCell = worksheet.getCell(`A${insightHeaderRow}`);
  insightHeaderCell.value = "💡 주요 분석 및 인사이트 (Key Insights)";
  insightHeaderCell.font = {
    name: "Pretendard",
    size: 11,
    bold: true,
    color: { argb: "1E3B70" },
  };

  const insightBoxStartRow = 26;
  const insightBoxEndRow = 28;
  worksheet.mergeCells(`A${insightBoxStartRow}:H${insightBoxEndRow}`);
  const insightCell = worksheet.getCell(`A${insightBoxStartRow}`);

  const defaultInsights = [
    "• 평일(8/5) 탐지 건수가 전주 대비 40% 증가하여 주요 오염 구역 집중 점검이 필요합니다.",
    "• 전체 폐기물 중 스티로폼 및 페트병이 50% 이상을 차지하므로 올바른 배출 안내가 시급합니다.",
    "• 처리 완료율은 30% 수준으로, 현장 조치 인력 배정 확대를 권장합니다.",
  ];

  const insightText = Array.isArray(data.insights)
    ? data.insights.map((item) => `• ${item}`).join("\n")
    : data.insights || defaultInsights.join("\n");

  insightCell.value = insightText;
  insightCell.font = {
    name: "Pretendard",
    size: 9.5,
    color: { argb: "334155" },
  };
  insightCell.alignment = {
    vertical: "top",
    horizontal: "left",
    wrapText: true,
  };
  insightCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "F1F5F9" },
  };

  // 인사이트 테두리 적용
  for (let r = insightBoxStartRow; r <= insightBoxEndRow; r++) {
    const cols = ["A", "B", "C", "D", "E", "F", "G", "H"];
    cols.forEach((col) => {
      worksheet.getCell(`${col}${r}`).border = thinBorder;
    });
  }

  // 엑셀 다운로드
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `통계분석보고서_${query?.startDate || "시작일"}_${query?.endDate || "종료일"}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};
