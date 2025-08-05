# FOMO-Server
📊 [FOMO] 한국 투자자를 위한 실시간 미국 시장 요약 & 알림 서비스

**기획 의도**:
- 미국 시장의 주요 발표를 번역·요약·알림으로 빠르게 전달하는 한국 투자자 맞춤 서비스
- FOMC, 실적 발표 등 핵심 정보가 영문으로 제공되어 즉각적인 이해와 대응에 어려움 존재
- 발표 직후 사용자 맞춤형 한글 요약 알림을 통해 정보 격차를 해소하고 투자 대응력을 높임

### Team Member
| 김지수 | 김민규 | 이민주 | 조정현 | 
| :---: | :---: | :---: | :---: |
| Full-Stack, Design, Infra | Full-Stack, AI | Full-Stack, AI | Full-Stack, Infra |
| <img src="https://avatars.githubusercontent.com/u/86948824?v=4" alt="김지수 프로필" width="180" height="180"> | <img src="https://github.com/user-attachments/assets/edc49f7f-41ad-46d9-8298-25e8480dd6b5" alt="김민규 프로필" width="180" height="180"> | <img src="https://github.com/user-attachments/assets/c46de923-bc5c-4a09-97aa-37cd7573dd40" alt="이민주 프로필" width="195" height="195"> | <img src="https://github.com/user-attachments/assets/2b9a329f-3d40-44dc-bd4b-846360426e69" t="조정현 프로필" width="180" height="180"> |
| [Jixoo-IT](https://github.com/Jixoo-IT) | [kmkkkp](https://github.com/kmkkkp) | [minju00](https://github.com/minju00) | [CISXO](https://github.com/CISXO) |


### 개발 기간
2025.07.02 - 2025.07.29

### 활용 기술 및 도구

- **Frontend**: Next.js, JavaScript
- **Backend**: Express, Node.js, MariaDB, Firebase Cloud Messaging
- **AI**: OpenAPI
- **Infra**: EC2, RDS, S3 Github Actions
- **Collaboration**: GitHub, Notion
---

### 활용 오픈 API

| 기능       | 이름                        |
|------------|-----------------------------|
| 차트       | 한국투자증권 OpenAPI        |
| 번역       | DeepL OpenAPI               |
| 요약분석   | GPT OpenAPI                 |
| 알림       | Telegram Open API           |
| 실적발표   | Finhub Stock API & Sec.gov  |
---

<br/>

## 실행 화면 

| 랜딩 페이지 | 실시간 차트 |
|:---------:|:---------:|
| <img src="https://github.com/user-attachments/assets/750c0594-8588-4bbd-9ce3-10a3d9548a84" width="250"> | <img src="https://github.com/user-attachments/assets/920a1a81-e24a-452d-9c13-187e148f619d" width="250"> |
| FOMC 상세 | 실적 발표 상세 |
| <img src="https://github.com/user-attachments/assets/e8b15c73-e27c-4c88-8dc3-f26c5041ad97" width="250"> | <img src="https://github.com/user-attachments/assets/cbdfd732-bfa8-4029-ad6c-26b76d6ff0df" width="250"> |
| 캘린더 | 알림 |
| <img src="https://github.com/user-attachments/assets/abbb0449-668b-450e-bce5-acc44f04e03f" width="250"> | <img src="https://github.com/user-attachments/assets/8a44c8a6-5a35-42df-ad45-2b49e765abe4" width="250"> |




## 시연 영상
https://pda-fomo-s3.s3.ap-northeast-2.amazonaws.com/image/pdaFinalFomo.mp4


<br/>

## 프로젝트 개요

### 1️⃣ 기획 의도
- 미국 주식 투자자들의 정보 격차를 해소하기 위한 요약·알림 기반 정보 서비스 제공  
- 영문 위주의 복잡한 발표 내용을 간결한 한글 요약으로 전달  
- 주요 이벤트 발표 직후, 관심 종목에 대한 정보를 맞춤형 & 실시간으로 받아볼 수 있는 구조 설계

<br/>

### 2️⃣ 기능 소개

1. 🛰 **실시간 정보 수집**  
   - FOMC 발표 및 실적 발표 자동 감지  
   - 주요 이벤트 누락 없이 실시간 수집  

2. 🗞 **번역/요약 제공**  
   - 발표 내용을 핵심 위주로 선별  
   - 한국어로 간결하게 요약 제공  

3. 📈 **실시간 차트 시각화**  
   - 발표 직후 주가 변동 흐름 시각화  
   - 종목별 반응을 한눈에 확인 가능  

4. 🔔 **맞춤형 알림 서비스**  
   - 주요 이벤트 발생 시 즉시 알림 전송  
   - 관심 종목 중심의 맞춤형 메시지 제공

<br/>

### 3️⃣ 기대효과

#### 📱 [기술적 기대효과]
1. **실시간 데이터 처리 및 인프라 이해도 향상**  
   - FOMC, 실적 발표 자동 감지 및 스케줄러 구현을 통해 이벤트 기반 백엔드 설계 경험  
   - Firebase Cloud Messaging 및 Telegram API 연동을 통한 실시간 알림 시스템 구축  
   - AWS S3, EC2, GitHub Actions 기반의 CI/CD 파이프라인 구성 경험

2. **확장 가능한 서비스 구조 설계 역량 강화**  
   - 사용자 관심 종목 기반 맞춤형 기능 설계 및 구현  
   - 도메인 단위 분리 및 서버-클라이언트 구조 이해도 향상  

#### 🧩 [사회적 기대효과]
1. **정보 접근성 향상**  
   - 복잡한 영어 기반 금융 정보를 요약·번역해 누구나 쉽게 이해할 수 있는 환경 제공  

2. **적시성 높은 투자 의사결정 지원**  
   - FOMC 및 실적 발표 직후 실시간 알림을 통해 빠른 대응 가능  

3. **투자자 중심의 데이터 소비 구조 구축**  
   - 관심 종목 위주로 필터링된 콘텐츠 제공으로 정보 피로도 감소 및 만족도 향상
<br/>

### 4️⃣ 프로젝트 구조

#### ERD
<img width="1826" height="808" alt="image" src="https://github.com/user-attachments/assets/b1635ba3-4d18-4c66-a69f-cb9b8f4b9ebc" />

#### 전체 아키텍처
<img width="1206" height="880" alt="image" src="https://github.com/user-attachments/assets/effd551b-a107-468b-835c-561558ebccbe" />

#### 한국투자증권 Open API 실시간 차트 아키텍처
<img width="1621" height="827" alt="image" src="https://github.com/user-attachments/assets/5d306eb0-3019-4a13-ad79-147260f8131f" />

#### FOMC 실시간 알림 아키텍처
<img width="1462" height="909" alt="image" src="https://github.com/user-attachments/assets/4d3b70c7-a9ba-4a22-8aeb-d8200821a3cc" />

#### 실적발표 실시간 알림 아키텍처
<img width="1513" height="892" alt="image" src="https://github.com/user-attachments/assets/ec6b62d7-f672-4523-a764-2af50d13ca78" />



