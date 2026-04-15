# rememberai

## Google Sheets 자동 링크 발송

구글 폼 응답이 연결된 시트에 새 행이 추가되면, 챗봇 링크를 이메일로 자동 발송하도록 Apps Script 파일을 추가했습니다.

파일:
- [google-apps-script/send-chatbot-link.gs](/Users/cschan/Documents/GitHub/rememberAI_test1/google-apps-script/send-chatbot-link.gs)
- [google-apps-script/schedule-webhook.gs](/Users/cschan/Documents/GitHub/rememberAI_test1/google-apps-script/schedule-webhook.gs)
- [google-apps-script/auth-webhook.gs](/Users/cschan/Documents/GitHub/rememberAI_test1/google-apps-script/auth-webhook.gs)
- [config.js](/Users/cschan/Documents/GitHub/rememberAI_test1/config.js)

적용 방법:
1. 구글 스프레드시트를 엽니다.
2. `확장 프로그램 > Apps Script`로 들어갑니다.
3. 기본 코드를 지우고 `google-apps-script/send-chatbot-link.gs` 내용을 붙여넣습니다.
4. `installFormSubmitTrigger()`를 한 번 실행해서 설치형 트리거를 만듭니다.
5. 권한 요청이 뜨면 메일 발송과 스프레드시트 접근 권한을 승인합니다.

동작 방식:
- 새 응답 행이 추가되면 이메일 컬럼을 찾아 챗봇 링크를 발송합니다.
- 발송 후 시트에 `챗봇 링크 발송`, `발송 시각` 컬럼을 자동으로 기록합니다.
- 현재 챗봇 링크는 `https://choisungcha.github.io/rememberai/chat.html`로 설정되어 있습니다.

## 대화 스케줄 저장 웹훅

첫 답변 이후 사용자가 선택한 요일/시간을 시트에 저장하려면 Apps Script를 웹앱으로 배포해 `config.js`의 `scheduleWebhookUrl`에 넣으면 됩니다.

설정 순서:
1. 구글 스프레드시트의 Apps Script에 [google-apps-script/schedule-webhook.gs](/Users/cschan/Documents/GitHub/rememberAI_test1/google-apps-script/schedule-webhook.gs) 내용을 추가합니다.
2. `배포 > 새 배포 > 웹 앱`으로 배포합니다.
3. 접근 권한은 최소한 사이트에서 POST 가능한 범위로 설정합니다.
4. 배포된 웹앱 URL을 [config.js](/Users/cschan/Documents/GitHub/rememberAI_test1/config.js)에 넣습니다.

예시:
```js
window.REMEMBER_AI_CONFIG = {
  scheduleWebhookUrl: 'https://script.google.com/macros/s/배포ID/exec',
};
```

연결되면:
- `chat.html`에서 첫 답변 후 저장한 요일/시간이 `대화 스케줄` 시트에 적재됩니다.
- 이후 이 시트를 기준으로 카카오/SMS 알림 발송 스크립트를 붙일 수 있습니다.

## 회원가입 / 로그인 웹훅

회원가입과 로그인은 Apps Script 웹앱 + `회원` 시트를 사용하는 방식으로 바꿨습니다.

설정 순서:
1. 구글 스프레드시트의 Apps Script에 [google-apps-script/auth-webhook.gs](/Users/cschan/Documents/GitHub/rememberAI_test1/google-apps-script/auth-webhook.gs) 내용을 추가합니다.
2. `배포 > 새 배포 > 웹 앱`으로 배포합니다.
3. 발급된 웹앱 URL을 [config.js](/Users/cschan/Documents/GitHub/rememberAI_test1/config.js)에 넣습니다.

예시:
```js
window.REMEMBER_AI_CONFIG = {
  scheduleWebhookUrl: 'https://script.google.com/macros/s/스케줄배포ID/exec',
  authWebhookUrl: 'https://script.google.com/macros/s/인증배포ID/exec',
};
```

연결되면:
- [signup.html](/Users/cschan/Documents/GitHub/rememberAI_test1/signup.html)에서 입력한 정보가 `회원` 시트에 저장됩니다.
- 비밀번호는 평문이 아니라 SHA-256 해시로 저장됩니다.
- [login.html](/Users/cschan/Documents/GitHub/rememberAI_test1/login.html)은 같은 시트를 기준으로 로그인합니다.
