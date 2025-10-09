// 페르소나 아바타 이미지 생성기
// 40개의 고품질 아바타 이미지를 랜덤으로 제공
// 🎨 코칭 프로필과 동일한 스타일의 아바타 캐릭터 세트 (40개 고품질 아바타)
const PREDEFINED_AVATARS = {
    female: [
        // 🎭 avatar.iran.liara.run 스타일 (코칭 프로필과 동일)
        'https://avatar.iran.liara.run/public/girl?username=anna',
        'https://avatar.iran.liara.run/public/girl?username=emma',
        'https://avatar.iran.liara.run/public/girl?username=sophia',
        'https://avatar.iran.liara.run/public/girl?username=olivia',
        'https://avatar.iran.liara.run/public/girl?username=charlotte',
        'https://avatar.iran.liara.run/public/girl?username=luna',
        'https://avatar.iran.liara.run/public/girl?username=zoe',
        'https://avatar.iran.liara.run/public/girl?username=maya',
        'https://avatar.iran.liara.run/public/girl?username=aria',
        'https://avatar.iran.liara.run/public/girl?username=nova',
        'https://avatar.iran.liara.run/public/girl?username=grace',
        'https://avatar.iran.liara.run/public/girl?username=ruby',
        'https://avatar.iran.liara.run/public/girl?username=stella',
        'https://avatar.iran.liara.run/public/girl?username=iris',
        'https://avatar.iran.liara.run/public/girl?username=vera',
        'https://avatar.iran.liara.run/public/girl?username=diana',
        'https://avatar.iran.liara.run/public/girl?username=flora',
        'https://avatar.iran.liara.run/public/girl?username=cleo',
        'https://avatar.iran.liara.run/public/girl?username=lyra',
        'https://avatar.iran.liara.run/public/girl?username=rose'
    ],
    male: [
        // 🎭 avatar.iran.liara.run 스타일 (코칭 프로필과 동일)
        'https://avatar.iran.liara.run/public/boy?username=alex',
        'https://avatar.iran.liara.run/public/boy?username=ryan',
        'https://avatar.iran.liara.run/public/boy?username=noah',
        'https://avatar.iran.liara.run/public/boy?username=liam',
        'https://avatar.iran.liara.run/public/boy?username=ethan',
        'https://avatar.iran.liara.run/public/boy?username=leo',
        'https://avatar.iran.liara.run/public/boy?username=kai',
        'https://avatar.iran.liara.run/public/boy?username=max',
        'https://avatar.iran.liara.run/public/boy?username=jay',
        'https://avatar.iran.liara.run/public/boy?username=ace',
        'https://avatar.iran.liara.run/public/boy?username=felix',
        'https://avatar.iran.liara.run/public/boy?username=milo',
        'https://avatar.iran.liara.run/public/boy?username=axel',
        'https://avatar.iran.liara.run/public/boy?username=enzo',
        'https://avatar.iran.liara.run/public/boy?username=otto',
        'https://avatar.iran.liara.run/public/boy?username=theo',
        'https://avatar.iran.liara.run/public/boy?username=nero',
        'https://avatar.iran.liara.run/public/boy?username=zeus',
        'https://avatar.iran.liara.run/public/boy?username=odin',
        'https://avatar.iran.liara.run/public/boy?username=loki'
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
