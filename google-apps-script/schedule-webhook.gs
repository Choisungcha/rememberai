const SCHEDULE_SHEET_NAME = '대화 스케줄';
const SCHEDULE_HEADERS = [
  '신청인 이름',
  '신청인 핸드폰 번호',
  '자녀 이름',
  '자녀 핸드폰 번호',
  '대화 요일',
  '대화 시간',
  '알림 채널',
  '저장 시각',
];

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    validateSchedulePayload_(payload);

    const sheet = getOrCreateScheduleSheet_();
    sheet.appendRow([
      payload.applicantName,
      payload.applicantPhone,
      payload.childName,
      payload.childPhone,
      payload.scheduleDay,
      payload.scheduleTime,
      payload.notificationChannel || '미정',
      new Date(),
    ]);

    return buildJsonResponse_(200, {
      ok: true,
      message: '스케줄이 저장되었습니다.',
    });
  } catch (error) {
    return buildJsonResponse_(400, {
      ok: false,
      message: error.message || '스케줄 저장 중 오류가 발생했습니다.',
    });
  }
}

function validateSchedulePayload_(payload) {
  const requiredKeys = [
    'applicantName',
    'applicantPhone',
    'childName',
    'childPhone',
    'scheduleDay',
    'scheduleTime',
  ];

  requiredKeys.forEach((key) => {
    if (!payload[key] || String(payload[key]).trim() === '') {
      throw new Error(`필수 값이 비어 있습니다: ${key}`);
    }
  });
}

function getOrCreateScheduleSheet_() {
  const spreadsheet = SpreadsheetApp.getActive();
  let sheet = spreadsheet.getSheetByName(SCHEDULE_SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SCHEDULE_SHEET_NAME);
  }

  const headerRange = sheet.getRange(1, 1, 1, SCHEDULE_HEADERS.length);
  const currentHeaders = headerRange.getValues()[0];
  const hasHeaders = SCHEDULE_HEADERS.every((header, index) => currentHeaders[index] === header);

  if (!hasHeaders) {
    headerRange.setValues([SCHEDULE_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function buildJsonResponse_(statusCode, payload) {
  const output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
