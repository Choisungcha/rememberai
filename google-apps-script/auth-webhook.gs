const MEMBER_SHEET_NAME = '회원';
const MEMBER_HEADERS = [
  '회원ID',
  '신청인 이름',
  '출생연도',
  '신청인 휴대폰 번호',
  '이메일',
  '비밀번호 해시',
  '자녀 이름',
  '자녀 휴대폰 번호',
  '가입 시각',
  '최근 로그인 시각',
  '상태',
];

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = String(payload.action || '').trim();

    if (action === 'register') {
      return buildAuthResponse_(handleRegister_(payload));
    }

    if (action === 'login') {
      return buildAuthResponse_(handleLogin_(payload));
    }

    throw new Error('지원하지 않는 action입니다.');
  } catch (error) {
    return buildAuthResponse_({
      ok: false,
      message: error.message || '인증 처리 중 오류가 발생했습니다.',
    });
  }
}

function handleRegister_(payload) {
  const requiredKeys = [
    'name',
    'birth',
    'phone',
    'email',
    'password',
    'childName',
    'childPhone',
  ];
  requiredKeys.forEach((key) => ensureValue_(payload[key], key));

  const sheet = getOrCreateMemberSheet_();
  const rows = getMemberRows_(sheet);
  const phone = normalizePhone_(payload.phone);
  const email = normalizeEmail_(payload.email);

  const alreadyExists = rows.some(
    (row) => row.phone === phone || row.email === email,
  );

  if (alreadyExists) {
    throw new Error('이미 가입된 휴대폰 번호 또는 이메일입니다.');
  }

  const memberId = 'member_' + new Date().getTime();
  const now = new Date();
  sheet.appendRow([
    memberId,
    String(payload.name).trim(),
    String(payload.birth).trim(),
    phone,
    email,
    hashPassword_(payload.password),
    String(payload.childName).trim(),
    normalizePhone_(payload.childPhone),
    now,
    '',
    'active',
  ]);

  return {
    ok: true,
    message: '회원가입이 완료되었습니다.',
    user: {
      memberId: memberId,
      name: String(payload.name).trim(),
      birth: String(payload.birth).trim(),
      phone: phone,
      email: email,
      childName: String(payload.childName).trim(),
      childPhone: normalizePhone_(payload.childPhone),
    },
  };
}

function handleLogin_(payload) {
  ensureValue_(payload.identifier, 'identifier');
  ensureValue_(payload.password, 'password');

  const sheet = getOrCreateMemberSheet_();
  const rows = getMemberRows_(sheet);
  const identifier = String(payload.identifier).trim();
  const normalizedIdentifier = identifier.indexOf('@') !== -1
    ? normalizeEmail_(identifier)
    : normalizePhone_(identifier);
  const passwordHash = hashPassword_(payload.password);

  const found = rows.find((row) => {
    return (
      row.status === 'active' &&
      (row.phone === normalizedIdentifier || row.email === normalizedIdentifier) &&
      row.passwordHash === passwordHash
    );
  });

  if (!found) {
    throw new Error('휴대폰 번호/이메일 또는 비밀번호가 일치하지 않습니다.');
  }

  sheet.getRange(found.rowIndex, 10).setValue(new Date());

  return {
    ok: true,
    message: '로그인되었습니다.',
    user: {
      memberId: found.memberId,
      name: found.name,
      birth: found.birth,
      phone: found.phone,
      email: found.email,
      childName: found.childName,
      childPhone: found.childPhone,
    },
  };
}

function getOrCreateMemberSheet_() {
  const spreadsheet = SpreadsheetApp.getActive();
  let sheet = spreadsheet.getSheetByName(MEMBER_SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(MEMBER_SHEET_NAME);
  }

  const headerRange = sheet.getRange(1, 1, 1, MEMBER_HEADERS.length);
  const currentHeaders = headerRange.getValues()[0];
  const hasHeaders = MEMBER_HEADERS.every((header, index) => currentHeaders[index] === header);

  if (!hasHeaders) {
    headerRange.setValues([MEMBER_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function getMemberRows_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }

  const values = sheet.getRange(2, 1, lastRow - 1, MEMBER_HEADERS.length).getValues();
  return values.map((row, index) => ({
    rowIndex: index + 2,
    memberId: String(row[0] || '').trim(),
    name: String(row[1] || '').trim(),
    birth: String(row[2] || '').trim(),
    phone: normalizePhone_(row[3] || ''),
    email: normalizeEmail_(row[4] || ''),
    passwordHash: String(row[5] || '').trim(),
    childName: String(row[6] || '').trim(),
    childPhone: normalizePhone_(row[7] || ''),
    status: String(row[10] || '').trim(),
  }));
}

function normalizePhone_(value) {
  return String(value || '').replace(/[^0-9]/g, '');
}

function normalizeEmail_(value) {
  return String(value || '').trim().toLowerCase();
}

function ensureValue_(value, key) {
  if (value === undefined || value === null || String(value).trim() === '') {
    throw new Error('필수 값이 비어 있습니다: ' + key);
  }
}

function hashPassword_(rawPassword) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(rawPassword),
    Utilities.Charset.UTF_8,
  );

  return digest
    .map(function (byte) {
      const normalized = byte < 0 ? byte + 256 : byte;
      return ('0' + normalized.toString(16)).slice(-2);
    })
    .join('');
}

function buildAuthResponse_(payload) {
  const output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
