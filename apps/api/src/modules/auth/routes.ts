import { Router } from 'express';
import { AuthController } from './controller.js';

const router = Router();
const controller = new AuthController();

// 회원가입
router.post('/signup', controller.signup);

// 로그인
router.post('/login', controller.login);

// 로그아웃
router.post('/logout', controller.logout);

// 세션 확인
router.get('/session', controller.getSession);

// 토큰 갱신
router.post('/refresh', controller.refreshToken);

// 비밀번호 재설정
router.post('/reset-password', controller.resetPassword);

// 비밀번호 업데이트
router.put('/password', controller.updatePassword);

// 소셜 로그인 URL 조회
router.get('/social/urls', controller.getSocialLoginUrls);

// 소셜 로그인 콜백
router.get('/kakao/callback', controller.kakaoCallback);
router.get('/naver/callback', controller.naverCallback);
router.get('/google/callback', controller.googleCallback);

export default router;