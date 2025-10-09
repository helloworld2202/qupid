// 페르소나 아바타 이미지 생성기
// 40개의 고품질 아바타 이미지를 랜덤으로 제공
// 미리 정의된 고품질 아바타 세트
const PREDEFINED_AVATARS = {
    female: [
        // 아바타 캐릭터 스타일 (실제 사람 사진 제거)
        'https://api.dicebear.com/7.x/avataaars/svg?seed=female1&backgroundColor=ff9bb3,ffb3ba,ffdfba&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=female2&backgroundColor=ffb3ba,ffdfba,ffffba&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=female3&backgroundColor=ffdfba,ffffba,baffc9&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=female4&backgroundColor=ffffba,baffc9,bae1ff&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=female5&backgroundColor=baffc9,bae1ff,ffb3e6&backgroundType=gradientLinear',
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
        // 아바타 캐릭터 스타일 (실제 사람 사진 제거)
        'https://api.dicebear.com/7.x/avataaars/svg?seed=male1&backgroundColor=ff9bb3,ffb3ba,ffdfba&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=male2&backgroundColor=ffb3ba,ffdfba,ffffba&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=male3&backgroundColor=ffdfba,ffffba,baffc9&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=male4&backgroundColor=ffffba,baffc9,bae1ff&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=male5&backgroundColor=baffc9,bae1ff,ffb3e6&backgroundType=gradientLinear',
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
// 🚀 간단하고 확실한 아바타 생성 함수
export const getRandomAvatar = (gender) => {
    if (gender === 'female') {
        return PREDEFINED_AVATARS.female[Math.floor(Math.random() * PREDEFINED_AVATARS.female.length)];
    }
    else {
        return PREDEFINED_AVATARS.male[Math.floor(Math.random() * PREDEFINED_AVATARS.male.length)];
    }
};
export const getConsistentAvatar = (name, gender) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const avatars = gender === 'female' ? PREDEFINED_AVATARS.female : PREDEFINED_AVATARS.male;
    const index = Math.abs(hash) % avatars.length;
    return avatars[index];
};
// 고품질 아바타 이미지 생성 함수 (기존 호환성 유지)
export const generateAvatarUrl = (gender, seed) => {
    return getRandomAvatar(gender);
};
