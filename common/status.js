
const STATUS = {
    SUCCESS: { code: 200, message: '성공' },
    CREATED: { code: 201, message: '생성됨' },
    BAD_REQUEST: { code: 400, message: '잘못된 요청' },
    UNAUTHORIZED: { code: 403, message: '권한 없음' },
    FORBIDDEN: { code: 403, message: '접근 금지' },
    NOT_FOUND: { code: 404, message: '찾을 수 없음' },
    INTERNAL_ERROR: { code: 500, message: '서버 내부 오류' },
};

module.exports = STATUS;
