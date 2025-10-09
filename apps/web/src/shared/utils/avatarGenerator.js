// 페르소나 아바타 이미지 생성기
// 40개의 고품질 아바타 이미지를 랜덤으로 제공
// 🎨 AI 스타일 아바타 캐릭터 세트 (40개 고품질 아바타)
const PREDEFINED_AVATARS = {
    female: [
        // 🎭 Avataaars 스타일 (일러스트레이션)
        'https://api.dicebear.com/7.x/avataaars/svg?seed=anna&backgroundColor=ff9bb3,ffb3ba,ffdfba&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=emma&backgroundColor=ffb3ba,ffdfba,ffffba&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=sophia&backgroundColor=ffdfba,ffffba,baffc9&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=olivia&backgroundColor=ffffba,baffc9,bae1ff&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=charlotte&backgroundColor=baffc9,bae1ff,ffb3e6&backgroundType=gradientLinear',
        // 🎨 Personas 스타일 (현실적)
        'https://api.dicebear.com/7.x/personas/svg?seed=luna&backgroundColor=ff9bb3,ffb3ba,ffdfba&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/personas/svg?seed=zoe&backgroundColor=ffb3ba,ffdfba,ffffba&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/personas/svg?seed=maya&backgroundColor=ffdfba,ffffba,baffc9&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/personas/svg?seed=aria&backgroundColor=ffffba,baffc9,bae1ff&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/personas/svg?seed=nova&backgroundColor=baffc9,bae1ff,ffb3e6&backgroundType=gradientLinear',
        // 🌈 Boring Avatars (모던 아트)
        'https://source.boringavatars.com/marble/200/luna?colors=ff9bb3,ffb3ba,ffdfba,ffffba,baffc9',
        'https://source.boringavatars.com/marble/200/zoe?colors=ffb3ba,ffdfba,ffffba,baffc9,bae1ff',
        'https://source.boringavatars.com/marble/200/maya?colors=ffdfba,ffffba,baffc9,bae1ff,ffb3e6',
        'https://source.boringavatars.com/marble/200/aria?colors=ffffba,baffc9,bae1ff,ffb3e6,ff9bb3',
        'https://source.boringavatars.com/marble/200/nova?colors=baffc9,bae1ff,ffb3e6,ff9bb3,ffb3ba',
        // 🎪 Fun-emoji 스타일 (재미있는)
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=anna&backgroundColor=ff9bb3,ffb3ba,ffdfba&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=emma&backgroundColor=ffb3ba,ffdfba,ffffba&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=sophia&backgroundColor=ffdfba,ffffba,baffc9&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=olivia&backgroundColor=ffffba,baffc9,bae1ff&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=charlotte&backgroundColor=baffc9,bae1ff,ffb3e6&backgroundType=gradientLinear',
        // 🎭 Multi Avatar (다양한 스타일)
        'https://api.multiavatar.com/anna.png',
        'https://api.multiavatar.com/emma.png'
    ],
    male: [
        // 🎭 Avataaars 스타일 (일러스트레이션)
        'https://api.dicebear.com/7.x/avataaars/svg?seed=alex&backgroundColor=ff9bb3,ffb3ba,ffdfba&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=ryan&backgroundColor=ffb3ba,ffdfba,ffffba&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=noah&backgroundColor=ffdfba,ffffba,baffc9&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=liam&backgroundColor=ffffba,baffc9,bae1ff&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=ethan&backgroundColor=baffc9,bae1ff,ffb3e6&backgroundType=gradientLinear',
        // 🎨 Personas 스타일 (현실적)
        'https://api.dicebear.com/7.x/personas/svg?seed=leo&backgroundColor=ff9bb3,ffb3ba,ffdfba&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/personas/svg?seed=kai&backgroundColor=ffb3ba,ffdfba,ffffba&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/personas/svg?seed=max&backgroundColor=ffdfba,ffffba,baffc9&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/personas/svg?seed=jay&backgroundColor=ffffba,baffc9,bae1ff&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/personas/svg?seed=ace&backgroundColor=baffc9,bae1ff,ffb3e6&backgroundType=gradientLinear',
        // 🌈 Boring Avatars (모던 아트)
        'https://source.boringavatars.com/marble/200/leo?colors=ff9bb3,ffb3ba,ffdfba,ffffba,baffc9',
        'https://source.boringavatars.com/marble/200/kai?colors=ffb3ba,ffdfba,ffffba,baffc9,bae1ff',
        'https://source.boringavatars.com/marble/200/max?colors=ffdfba,ffffba,baffc9,bae1ff,ffb3e6',
        'https://source.boringavatars.com/marble/200/jay?colors=ffffba,baffc9,bae1ff,ffb3e6,ff9bb3',
        'https://source.boringavatars.com/marble/200/ace?colors=baffc9,bae1ff,ffb3e6,ff9bb3,ffb3ba',
        // 🎪 Fun-emoji 스타일 (재미있는)
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=alex&backgroundColor=ff9bb3,ffb3ba,ffdfba&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=ryan&backgroundColor=ffb3ba,ffdfba,ffffba&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=noah&backgroundColor=ffdfba,ffffba,baffc9&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=liam&backgroundColor=ffffba,baffc9,bae1ff&backgroundType=gradientLinear',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=ethan&backgroundColor=baffc9,bae1ff,ffb3e6&backgroundType=gradientLinear',
        // 🎭 Multi Avatar (다양한 스타일)
        'https://api.multiavatar.com/alex.png',
        'https://api.multiavatar.com/ryan.png'
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
