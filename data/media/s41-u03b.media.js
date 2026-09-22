// 화산 실험실 — 실제 사진·영상(위키미디어 공용, 자유 이용 라이선스). 저장소에 넣지 않고 원본 주소를 그대로 쓴다.
// 출처 표기가 필요한 것(CC BY·CC BY-SA)은 credit을 화면에 그대로 보여 준다. PD·CC0는 출처만 적는다.
const C = 'https://upload.wikimedia.org/wikipedia/commons';
const T = 'https://upload.wikimedia.org/wikipedia/commons/thumb';
// 영상은 세 갈래로 준비한다: webm 480p(가벼움) → mp4(mov, 사파리·아이폰용) → 원본. 하나가 막혀도 다른 것이 재생된다.
const V = (path, name) => ({ src: `${C}/transcoded/${path}/${name}/${name}.480p.vp9.webm`, mp4: `${C}/transcoded/${path}/${name}/${name}.360p.mpeg4.mov`, full: `${C}/${path}/${name}`, page: `https://commons.wikimedia.org/wiki/File:${name}` });
export const media = {
  // ① 궁금: 3D 아래에 실제 분출 영상
  engage: { kind: 'video', title: '진짜 화산이 분출하는 모습 (하와이 킬라우에아, 2018)', ...V('a/ab', 'Fissure_fountains_feed_lava_flows%2C_as_shown_in_this_overflight_video_of_the_F....webm'),
    credit: 'USGS Volcanoes · 공개 저작물(Public domain)', poster: `${C}/b/b8/Puu_Oo_looking_up_Kilauea_-_edit.jpg` },
  // ③ 개념: 실제 사진 갤러리(순서 = 개념 순서)
  gallery: [
    { src: `${T}/4/48/Augustine_volcano_Jan_24_2006_-_Cyrus_Read.jpg/1280px-Augustine_volcano_Jan_24_2006_-_Cyrus_Read.jpg`, page: 'https://commons.wikimedia.org/wiki/File:Augustine_volcano_Jan_24_2006_-_Cyrus_Read.jpg',
      cap: '화산이 분출해요 — 하늘로 치솟는 화산재와 화산 가스 (미국 알래스카 어거스틴 화산)', credit: 'Cyrus Read, USGS · Public domain' },
    { src: `${C}/b/b8/Puu_Oo_looking_up_Kilauea_-_edit.jpg`, page: 'https://commons.wikimedia.org/wiki/File:Puu_Oo_looking_up_Kilauea_-_edit.jpg',
      cap: '용암이 분수처럼 솟아요 — 액체인 용암 (하와이 킬라우에아)', credit: 'USGS · Public domain' },
    { src: `${C}/8/82/Pahoehoe_toe.jpg`, page: 'https://commons.wikimedia.org/wiki/File:Pahoehoe_toe.jpg',
      cap: '흘러가는 용암 — 겉은 식어 검게 굳고 속은 아직 빨갛게 뜨거워요', credit: 'Hawaii Volcano Observatory · Public domain' },
    { src: `${T}/7/77/Gr%C3%ADmsv%C3%B6tn_2011_eruption_2.jpg/1280px-Gr%C3%ADmsv%C3%B6tn_2011_eruption_2.jpg`, page: 'https://commons.wikimedia.org/wiki/File:Gr%C3%ADmsv%C3%B6tn_2011_eruption_2.jpg',
      cap: '화산재 구름 — 아주 작은 알갱이(고체)가 하늘을 덮어 비행기가 뜨지 못해요 (아이슬란드, 2011)', credit: 'Calistemon · CC BY-SA 3.0' },
    { src: `${T}/7/76/Vesicular_alkaline_olivine_basalt_%28Bonito_Lava_Flow%2C_upper_Holocene%2C_erupted_from_Sunset_Crater%3B_San_Francisco_Volcanic_Field%2C_Arizona%2C_USA%29_20_%2849128518126%29.jpg/1280px-thumbnail.jpg`,
      page: 'https://commons.wikimedia.org/wiki/File:Vesicular_alkaline_olivine_basalt_(Bonito_Lava_Flow,_upper_Holocene,_erupted_from_Sunset_Crater;_San_Francisco_Volcanic_Field,_Arizona,_USA)_20_(49128518126).jpg',
      cap: '현무암 — 땅 위에서 빨리 식어 알갱이가 작고 어두워요. 구멍은 가스가 빠져나간 자리', credit: 'James St. John · CC BY 2.0' },
    { src: `${T}/0/0f/YSP-Jgr6.jpg/1280px-YSP-Jgr6.jpg`, page: 'https://commons.wikimedia.org/wiki/File:YSP-Jgr6.jpg',
      cap: '화강암 — 땅속에서 천천히 식어 알갱이가 커요. 흰색·분홍색·검은색 알갱이가 보여요', credit: 'Dittwjfsdgkvkdjg · CC BY-SA 3.0' },
    { src: `${C}/6/6d/Baitou_Mountain_Tianchi.jpg`, page: 'https://commons.wikimedia.org/wiki/File:Baitou_Mountain_Tianchi.jpg',
      cap: '백두산 천지 — 화산 분출로 생긴 커다란 분화구에 물이 고였어요', credit: 'Bdpmax · CC BY-SA 3.0' },
    { src: `${T}/1/1a/Hallasan_2.jpg/1280px-Hallasan_2.jpg`, page: 'https://commons.wikimedia.org/wiki/File:Hallasan_2.jpg',
      cap: '한라산 백록담 — 우리나라에도 화산이 있어요. 꼭대기의 분화구', credit: '위키미디어 공용 · 자유 이용 라이선스' },
    { src: `${T}/f/f0/Dol_Hareubangs_at_Daepo_Jusangjeolli_Cliff_01.jpg/1280px-Dol_Hareubangs_at_Daepo_Jusangjeolli_Cliff_01.jpg`, page: 'https://commons.wikimedia.org/wiki/File:Dol_Hareubangs_at_Daepo_Jusangjeolli_Cliff_01.jpg',
      cap: '제주 돌하르방과 주상절리 — 둘 다 현무암이에요. 뒤의 기둥 모양 절벽은 용암이 식으면서 갈라진 것', credit: 'Bernard Gagnon · CC0' },
    { src: `${T}/b/b4/Dol_Hareubang_in_Spirited_Garden_01.jpg/960px-Dol_Hareubang_in_Spirited_Garden_01.jpg`, page: 'https://commons.wikimedia.org/wiki/File:Dol_Hareubang_in_Spirited_Garden_01.jpg',
      cap: '돌하르방 가까이 보기 — 구멍이 숭숭 뚫린 현무암', credit: 'Bernard Gagnon · CC0', tall: true },
    { src: `${T}/3/3f/Grand_Prismatic_Spring_and_Midway_Geyser_Basin_from_above.jpg/1280px-Grand_Prismatic_Spring_and_Midway_Geyser_Basin_from_above.jpg`, page: 'https://commons.wikimedia.org/wiki/File:Grand_Prismatic_Spring_and_Midway_Geyser_Basin_from_above.jpg',
      cap: '온천 — 화산 근처 땅속의 열이 물을 데워요. 화산이 주는 이로운 점 (미국 옐로스톤)', credit: 'Brocken Inaglory · CC BY-SA 3.0' },
  ],
  // ② 실험 3D 보기 아래: 용암이 흐르고 굳는 영상
  explore: { kind: 'video', title: '용암이 길 위로 흘러와 굳는 모습 (하와이, 2018)', ...V('2/25', 'Fissure_21_p%C4%81hoehoe_lava_flows_ooze_onto_Kaupili_Street%2C_in_the_Leilani_Estat....webm'),
    credit: 'USGS Volcanoes · Public domain', prompt: '흐르는 안쪽은 밝고, 먼저 식은 겉은 어둡게 굳는 모습을 찾아봐요.' },
  // ④ 확장 읽기 옆 사진
  reading: { src: `${T}/b/b4/Dol_Hareubang_in_Spirited_Garden_01.jpg/960px-Dol_Hareubang_in_Spirited_Garden_01.jpg`, cap: '돌하르방 (제주)', credit: 'Bernard Gagnon · CC0' },
};
