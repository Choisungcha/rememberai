# rememberai

## Google Sheets 자동 링크 발송

구글 폼 응답이 연결된 시트에 새 행이 추가되면, 챗봇 링크를 이메일로 자동 발송하도록 Apps Script 파일을 추가했습니다.

파일:
- [google-apps-script/send-chatbot-link.gs](/Users/cschan/Documents/GitHub/rememberAI_test1/google-apps-script/send-chatbot-link.gs)

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
