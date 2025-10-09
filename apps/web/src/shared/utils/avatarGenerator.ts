// 페르소나 아바타 이미지 생성기
// 40개의 고품질 아바타 이미지를 랜덤으로 제공

interface AvatarConfig {
  gender: 'male' | 'female';
  style: 'realistic' | 'illustration' | 'anime';
  seed: number;
}

// 고품질 아바타 이미지 생성 함수
export const generateAvatarUrl = (gender: 'male' | 'female', seed?: number): string => {
  // 시드가 없으면 랜덤 생성
  const avatarSeed = seed || Math.floor(Math.random() * 1000000);
  
  // 다양한 스타일의 고품질 아바타 제공
  const styles = [
    'realistic',
    'illustration', 
    'anime'
  ];
  
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  
  // 기본 설정
  const config: AvatarConfig = {
    gender,
    style: randomStyle as any,
    seed: avatarSeed
  };
  
  // 여러 고품질 아바타 서비스 활용
  const avatarServices = [
    // 1. DiceBear (다양한 스타일, 고품질)
    `https://api.dicebear.com/7.x/${config.gender === 'male' ? 'male' : 'female'}/svg?seed=${config.seed}&backgroundColor=ff9bb3,ffb3ba,ffdfba,ffffba,baffc9,bae1ff,ffb3e6&backgroundType=gradientLinear`,
    
    // 2. UI Avatars (깔끔한 스타일)
    `https://ui-avatars.com/api/?name=${encodeURIComponent(gender === 'male' ? 'Male' : 'Female')}&background=ff9bb3&color=fff&size=200&bold=true&font-size=0.7`,
    
    // 3. Boring Avatars (모던한 스타일)
    `https://source.boringavatars.com/marble/200/${config.seed}?colors=ff9bb3,ffb3ba,ffdfba,ffffba,baffc9`,
    
    // 4. Multi Avatar (다양한 옵션)
    `https://api.multiavatar.com/${config.seed}.png?apikey=multiavatar`,
    
    // 5. Robohash (로봇 스타일)
    `https://robohash.org/${config.seed}?set=set${config.gender === 'male' ? '2' : '4'}&size=200x200&bgset=bg1`,
    
    // 6. Avataaars (일러스트레이션 스타일)
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${config.seed}&backgroundColor=ff9bb3,ffb3ba,ffdfba,ffffba,baffc9&backgroundType=gradientLinear`,
    
    // 7. Personas (현실적 스타일)
    `https://api.dicebear.com/7.x/personas/svg?seed=${config.seed}&backgroundColor=ff9bb3,ffb3ba,ffdfba,ffffba,baffc9&backgroundType=gradientLinear`,
    
    // 8. Fun-emoji (재미있는 스타일)
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${config.seed}&backgroundColor=ff9bb3,ffb3ba,ffdfba,ffffba,baffc9&backgroundType=gradientLinear`
  ];
  
  // 랜덤하게 서비스 선택
  const selectedService = avatarServices[Math.floor(Math.random() * avatarServices.length)];
  
  return selectedService;
};

// 미리 정의된 고품질 아바타 세트 (캐싱용)
const PREDEFINED_AVATARS = {
  female: [
    // 현실적 스타일
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face&auto=format',
    
    // 일러스트레이션 스타일
    'https://api.dicebear.com/7.x/avataaars/svg?seed=1&backgroundColor=ff9bb3,ffb3ba,ffdfba&backgroundType=gradientLinear',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=2&backgroundColor=ffb3ba,ffdfba,ffffba&backgroundType=gradientLinear',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=3&backgroundColor=ffdfba,ffffba,baffc9&backgroundType=gradientLinear',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=4&backgroundColor=ffffba,baffc9,bae1ff&backgroundType=gradientLinear',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=5&backgroundColor=baffc9,bae1ff,ffb3e6&backgroundType=gradientLinear',
    
    // 모던 스타일
    'https://source.boringavatars.com/marble/200/1?colors=ff9bb3,ffb3ba,ffdfba,ffffba,baffc9',
    'https://source.boringavatars.com/marble/200/2?colors=ffb3ba,ffdfba,ffffba,baffc9,bae1ff',
    'https://source.boringavatars.com/marble/200/3?colors=ffdfba,ffffba,baffc9,bae1ff,ffb3e6',
    'https://source.boringavatars.com/marble/200/4?colors=ffffba,baffc9,bae1ff,ffb3e6,ff9bb3',
    'https://source.boringavatars.com/marble/200/5?colors=baffc9,bae1ff,ffb3e6,ff9bb3,ffb3ba',
    
    // 재미있는 스타일
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=1&backgroundColor=ff9bb3,ffb3ba,ffdfba&backgroundType=gradientLinear',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=2&backgroundColor=ffb3ba,ffdfba,ffffba&backgroundType=gradientLinear',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=3&backgroundColor=ffdfba,ffffba,baffc9&backgroundType=gradientLinear',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=4&backgroundColor=ffffba,baffc9,bae1ff&backgroundType=gradientLinear',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=5&backgroundColor=baffc9,bae1ff,ffb3e6&backgroundType=gradientLinear',
    
    // 추가 고품질 이미지
    'https://api.multiavatar.com/female1.png',
    'https://api.multiavatar.com/female2.png'
  ],
  
  male: [
    // 현실적 스타일
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=200&h=200&fit=crop&crop=face&auto=format',
    
    // 일러스트레이션 스타일
    'https://api.dicebear.com/7.x/avataaars/svg?seed=11&backgroundColor=ff9bb3,ffb3ba,ffdfba&backgroundType=gradientLinear',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=12&backgroundColor=ffb3ba,ffdfba,ffffba&backgroundType=gradientLinear',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=13&backgroundColor=ffdfba,ffffba,baffc9&backgroundType=gradientLinear',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=14&backgroundColor=ffffba,baffc9,bae1ff&backgroundType=gradientLinear',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=15&backgroundColor=baffc9,bae1ff,ffb3e6&backgroundType=gradientLinear',
    
    // 모던 스타일
    'https://source.boringavatars.com/marble/200/11?colors=ff9bb3,ffb3ba,ffdfba,ffffba,baffc9',
    'https://source.boringavatars.com/marble/200/12?colors=ffb3ba,ffdfba,ffffba,baffc9,bae1ff',
    'https://source.boringavatars.com/marble/200/13?colors=ffdfba,ffffba,baffc9,bae1ff,ffb3e6',
    'https://source.boringavatars.com/marble/200/14?colors=ffffba,baffc9,bae1ff,ffb3e6,ff9bb3',
    'https://source.boringavatars.com/marble/200/15?colors=baffc9,bae1ff,ffb3e6,ff9bb3,ffb3ba',
    
    // 재미있는 스타일
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=11&backgroundColor=ff9bb3,ffb3ba,ffdfba&backgroundType=gradientLinear',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=12&backgroundColor=ffb3ba,ffdfba,ffffba&backgroundType=gradientLinear',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=13&backgroundColor=ffdfba,ffffba,baffc9&backgroundType=gradientLinear',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=14&backgroundColor=ffffba,baffc9,bae1ff&backgroundType=gradientLinear',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=15&backgroundColor=baffc9,bae1ff,ffb3e6&backgroundType=gradientLinear',
    
    // 추가 고품질 이미지
    'https://api.multiavatar.com/male1.png',
    'https://api.multiavatar.com/male2.png'
  ]
};

// 랜덤 아바타 선택 함수
export const getRandomAvatar = (gender: 'male' | 'female'): string => {
  const avatars = PREDEFINED_AVATARS[gender];
  const randomIndex = Math.floor(Math.random() * avatars.length);
  return avatars[randomIndex];
};

// 이름 기반 일관된 아바타 생성 (같은 이름은 항상 같은 아바타)
export const getConsistentAvatar = (name: string, gender: 'male' | 'female'): string => {
  // 이름을 숫자로 변환하여 시드 생성
  let seed = 0;
  for (let i = 0; i < name.length; i++) {
    seed += name.charCodeAt(i);
  }
  
  const avatars = PREDEFINED_AVATARS[gender];
  const index = seed % avatars.length;
  return avatars[index];
};

// 아바타 품질 검증 함수
export const validateAvatarUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// 아바타 fallback 시스템
export const getAvatarWithFallback = async (name: string, gender: 'male' | 'female'): Promise<string> => {
  const primaryAvatar = getConsistentAvatar(name, gender);
  
  // 품질 검증
  const isValid = await validateAvatarUrl(primaryAvatar);
  if (isValid) {
    return primaryAvatar;
  }
  
  // fallback: 다른 아바타 시도
  const fallbackAvatar = getRandomAvatar(gender);
  const isFallbackValid = await validateAvatarUrl(fallbackAvatar);
  if (isFallbackValid) {
    return fallbackAvatar;
  }
  
  // 최종 fallback: 기본 아바타
  return generateAvatarUrl(gender, Math.floor(Math.random() * 1000));
};
