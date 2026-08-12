import Workbook from "exceljs";

/**
 * QuickChart API를 활용한 차트 이미지 URL 생성 유틸리티
 */
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

/**
 * 통계 분석 보고서 엑셀 내보내기 (인사이트 차트 하단 배치)
 * @param {Object} data - 통계 데이터
 * @param {Object} query - 조회 조건
 */
export const exportAnalyticsToExcel = async (data, query) => {
  if (!data) {
    alert("내보낼 통계 데이터가 없습니다.");
    return;
  }

  const workbook = new Workbook.Workbook();
  const worksheet = workbook.addWorksheet("통계 분석 보고서");

  // 1. 인쇄 영역 및 용지 맞춤 설정 (차트 + 인사이트 하단까지 A1:H29 범위 설정)
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: "landscape", // 가로 방향
    printArea: "A1:H29", // 인쇄 영역
    fitToPage: true,
    fitToWidth: 1, // 가로 1페이지
    fitToHeight: 1, // 세로 1페이지
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

  // 2. 총 8개 열 설정 (A~H)
  worksheet.columns = [
    { width: 15.5 },
    { width: 15.5 },
    { width: 15.5 },
    { width: 15.5 },
    { width: 15.5 },
    { width: 15.5 },
    { width: 15.5 },
    { width: 15.5 },
  ];

  // 3. 타이틀 영역
  worksheet.mergeCells("A1:H1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "통계 분석 보고서";
  titleCell.font = { name: "Pretendard", size: 18, bold: true, color: { argb: "0F172A" } };

  worksheet.mergeCells("A2:H2");
  const subTitleCell = worksheet.getCell("A2");
  subTitleCell.value = `조회 기간 : ${query.startDate} ~ ${query.endDate}`;
  subTitleCell.font = { name: "Pretendard", size: 11, color: { argb: "64748B" } };

  worksheet.addRow([]);

  // 4. 표 헤더 영역
  const headerRowIndex = 4;
  worksheet.mergeCells(`A${headerRowIndex}:B${headerRowIndex}`);
  worksheet.mergeCells(`C${headerRowIndex}:D${headerRowIndex}`);
  worksheet.mergeCells(`E${headerRowIndex}:F${headerRowIndex}`);
  worksheet.mergeCells(`G${headerRowIndex}:H${headerRowIndex}`);

  worksheet.getCell(`A${headerRowIndex}`).value = "지표명";
  worksheet.getCell(`C${headerRowIndex}`).value = "수치";
  worksheet.getCell(`E${headerRowIndex}`).value = "비고";
  worksheet.getCell(`G${headerRowIndex}`).value = "상태";

  const headerRow = worksheet.getRow(headerRowIndex);
  headerRow.height = 28;

  ["A", "C", "E", "G"].forEach((col) => {
    const cell = worksheet.getCell(`${col}${headerRowIndex}`);
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1E3B70" } };
    cell.font = { name: "Pretendard", size: 11, bold: true, color: { argb: "FFFFFF" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  const applyMergedBorder = (startCol, endCol, rowIdx) => {
    const cols = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const start = cols.indexOf(startCol);
    const end = cols.indexOf(endCol);
    for (let i = start; i <= end; i++) {
      worksheet.getCell(`${cols[i]}${rowIdx}`).border = thinBorder;
    }
  };

  const cellPairs = [["A","B"], ["C","D"], ["E","F"], ["G","H"]];
  cellPairs.forEach((pair) => applyMergedBorder(pair[0], pair[1], headerRowIndex));

  // 5. 표 데이터 행 추가
  const summaryRowsData = [
    ["기간 내 점검", `${data.summary?.totalInspections || 0}건`, `일평균 ${data.summary?.dailyAvgInspections || 0}건`, "정상"],
    ["탐지 폐기물", `${data.summary?.totalDetections || 0}개`, "전주 대비 +7.5%", "증가"],
    ["최다 탐지 항목", data.summary?.topDetectedItem?.name || "-", `${data.summary?.topDetectedItem?.count || 0}개`, "주의"],
    ["처리 완료율", `${data.summary?.resolutionRate || 0}%`, `${data.summary?.resolvedCount || 0}건 완료`, "양호"],
  ];

  summaryRowsData.forEach((rowData, idx) => {
    const currentRowIdx = 5 + idx;
    worksheet.mergeCells(`A${currentRowIdx}:B${currentRowIdx}`);
    worksheet.mergeCells(`C${currentRowIdx}:D${currentRowIdx}`);
    worksheet.mergeCells(`E${currentRowIdx}:F${currentRowIdx}`);
    worksheet.mergeCells(`G${currentRowIdx}:H${currentRowIdx}`);

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
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F8FAFC" } };
      applyMergedBorder(pair[0], pair[1], currentRowIdx);
    });
  });

  // 6. QuickChart API 차트 설정 (표 아래 10행 위치에 배치)
  const barChartConfig = {
    type: "bar",
    data: {
      labels: data.dailyStats?.map((item) => item.date) || ["08/01", "08/02", "08/03", "08/04", "08/05", "08/06", "08/07"],
      datasets: [
        {
          label: "탐지 건수",
          data: data.dailyStats?.map((item) => item.count) || [6, 6, 5, 2, 7, 4, 3],
          backgroundColor: ["#6366f1", "#6366f1", "#6366f1", "#6366f1", "#ec4899", "#6366f1", "#6366f1"],
          borderRadius: 6,
        },
      ],
    },
    options: {
      title: { display: true, text: "기간별 탐지 추이", fontSize: 16, fontColor: "#0f172a" },
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

  const doughnutChartConfig = {
    type: "doughnut",
    data: {
      labels: data.wasteDistribution?.map((item) => item.name) || ["기타", "로프", "스티로폼", "어망", "페트병", "플라스틱"],
      datasets: [
        {
          data: data.wasteDistribution?.map((item) => item.value) || [12, 18, 25, 15, 20, 10],
          backgroundColor: ["#ec4899", "#3b82f6", "#06b6d4", "#6366f1", "#8b5cf6", "#0ea5e9"],
        },
      ],
    },
    options: {
      title: { display: true, text: "폐기물 분포", fontSize: 16, fontColor: "#0f172a" },
      legend: { position: "right", labels: { boxWidth: 12, fontSize: 11 } },
      plugins: {
        datalabels: {
          display: true,
          color: "#ffffff",
          font: { weight: "bold", size: 12 },
          formatter: (value) => `${value}개`,
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

    const barImageId = workbook.addImage({
      buffer: barBlob,
      extension: "png",
    });

    const doughnutImageId = workbook.addImage({
      buffer: doughnutBlob,
      extension: "png",
    });

    // 차트 배치 (표 바로 아래: row index 10 = 엑셀 11행)
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
    console.error("QuickChart 이미지 생성/삽입 중 오류 발생:", err);
  }

  // ==========================================
  // 7. 인사이트(Insight) 영역 추가 (차트 하단 배치: 25~28행)
  // ==========================================
  const insightHeaderRow = 25;
  worksheet.mergeCells(`A${insightHeaderRow}:H${insightHeaderRow}`);
  const insightHeaderCell = worksheet.getCell(`A${insightHeaderRow}`);
  insightHeaderCell.value = "💡 주요 분석 및 인사이트 (Key Insights)";
  insightHeaderCell.font = { name: "Pretendard", size: 11, bold: true, color: { argb: "1E3B70" } };

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
  insightCell.font = { name: "Pretendard", size: 9.5, color: { argb: "334155" } };
  insightCell.alignment = { vertical: "top", horizontal: "left", wrapText: true };
  insightCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F1F5F9" } };

  // 인사이트 테두리 적용
  for (let r = insightBoxStartRow; r <= insightBoxEndRow; r++) {
    const cols = ["A", "B", "C", "D", "E", "F", "G", "H"];
    cols.forEach((col) => {
      worksheet.getCell(`${col}${r}`).border = thinBorder;
    });
  }

  // 8. 엑셀 파일 다운로드
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `통계분석보고서_${query.startDate}_${query.endDate}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};