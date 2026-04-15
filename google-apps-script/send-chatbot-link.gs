const CHATBOT_URL = 'https://choisungcha.github.io/rememberai/chat.html';
const STATUS_SENT_HEADER = '챗봇 링크 발송';
const STATUS_SENT_AT_HEADER = '발송 시각';

function onFormSubmit(e) {
  if (!e || !e.range) {
    throw new Error('설치형 onFormSubmit 트리거에서만 실행할 수 있습니다.');
  }

  const sheet = e.range.getSheet();
  const rowIndex = e.range.getRow();
  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .map((header) => String(header).trim());
  const rowValues = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
  const row = Object.fromEntries(headers.map((header, index) => [header, rowValues[index]]));

  const email = findFirstValue_(row, [
    '이메일',
    '이메일 주소',
    'email',
    'Email',
    'E-mail',
    '메일',
  ]);

  if (!email) {
    throw new Error('응답 행에서 이메일 컬럼을 찾지 못했습니다.');
  }

  const name =
    findFirstValue_(row, ['이름', '성함', '고객명', 'name', 'Name']) || '고객님';

  const subject = '[리멤버AI] 대화 챗봇 링크를 보내드립니다';
  const body = [
    `${name}, 안녕하세요.`,
    '',
    '리멤버AI 대화 챗봇 링크를 보내드립니다.',
    '아래 주소를 눌러 바로 대화를 시작하실 수 있습니다.',
    '',
    CHATBOT_URL,
    '',
    '감사합니다.',
    '리멤버AI 드림',
  ].join('\n');

  MailApp.sendEmail({
    to: String(email).trim(),
    subject,
    body,
  });

  const sentStatusColumn = ensureColumn_(sheet, STATUS_SENT_HEADER);
  const sentAtColumn = ensureColumn_(sheet, STATUS_SENT_AT_HEADER);
  sheet.getRange(rowIndex, sentStatusColumn).setValue('발송 완료');
  sheet.getRange(rowIndex, sentAtColumn).setValue(new Date());
}

function installFormSubmitTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  const alreadyInstalled = triggers.some(
    (trigger) =>
      trigger.getHandlerFunction() === 'onFormSubmit' &&
      trigger.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT,
  );

  if (alreadyInstalled) {
    return;
  }

  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onFormSubmit()
    .create();
}

function findFirstValue_(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
      return row[key];
    }
  }

  return '';
}

function ensureColumn_(sheet, headerName) {
  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .map((header) => String(header).trim());
  const existingIndex = headers.indexOf(headerName);

  if (existingIndex !== -1) {
    return existingIndex + 1;
  }

  const columnIndex = headers.length + 1;
  sheet.getRange(1, columnIndex).setValue(headerName);
  return columnIndex;
}
