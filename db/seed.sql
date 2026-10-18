-- デモ用の初期データ（ローカル: mise run db:seed）。#32 の大会デモマップを追加
-- ログイン: kanko@example.com / other@example.com（パスワードはどちらも demo-pass-1234）

INSERT INTO user (id, name, email, email_verified) VALUES
  ('user-kanko', '渋川観光協会', 'kanko@example.com', 1),
  ('user-other', '海辺のカフェ', 'other@example.com', 1);

INSERT INTO account (id, account_id, provider_id, user_id, password) VALUES
  ('account-kanko', 'user-kanko', 'credential', 'user-kanko', '8f9570c1d9b3c213e34302e14dae37ac:8ea964e5270d5fcc6e4c5bee51a37a734adae399c9f9193217b317cbc5c8a9e630bafd49e4101aa3f96ce59d7b53ac79b259cb915f4274cac1b14aaf3221525f'),
  ('account-other', 'user-other', 'credential', 'user-other', '8f9570c1d9b3c213e34302e14dae37ac:8ea964e5270d5fcc6e4c5bee51a37a734adae399c9f9193217b317cbc5c8a9e630bafd49e4101aa3f96ce59d7b53ac79b259cb915f4274cac1b14aaf3221525f');

INSERT INTO maps (id, owner_id, title, description, published) VALUES
  ('shibukawa', 'user-kanko', '渋川さんぽマップ', '家族でもデートでも楽しめる、渋川のおすすめスポットをまとめました。', 1),
  ('demo-cafe', 'user-other', '海辺のカフェめぐり', '海を眺めながら休めるカフェを集めました。', 1),
  ('draft-map', 'user-kanko', '作成中のマップ', '', 0);

INSERT INTO layers (id, map_id, name, sort_order) VALUES
  ('family', 'shibukawa', '家族向け', 0),
  ('date', 'shibukawa', 'デート向け', 1);

INSERT INTO spots (id, map_id, name, description, lat, lng, start_date, end_date) VALUES
  ('spot-beach', 'shibukawa', '渋川海岸', '遠浅で穏やかな海水浴場。', 34.4539, 133.9047, NULL, NULL),
  ('spot-ojigatake', 'shibukawa', '王子が岳', '瀬戸内海を一望できる展望スポット。', 34.4619, 133.8822, NULL, NULL),
  ('spot-event', 'shibukawa', 'ビーチイベント', '週末限定の臨時スポット。', 34.4536, 133.9040, '2026-01-01', '2099-12-31'),
  ('spot-cafe', 'demo-cafe', '海辺のカフェ', '', 34.4550, 133.9058, NULL, NULL);

INSERT INTO spot_layers (spot_id, layer_id) VALUES
  ('spot-beach', 'family'),
  ('spot-beach', 'date'),
  ('spot-ojigatake', 'date'),
  ('spot-event', 'family');

-- id は作成順の並びを決めるので、出したい順に辞書順で並ぶ名前にする
INSERT INTO layer_fields (id, layer_id, name) VALUES
  ('family-1', 'family', '授乳室'),
  ('family-2', 'family', '駐車場'),
  ('family-3', 'family', 'ベビーカー');

INSERT INTO spot_field_values (spot_id, field_id, value) VALUES
  ('spot-beach', 'family-1', 'あり（海の家の2階）'),
  ('spot-beach', 'family-2', '無料 約100台'),
  ('spot-beach', 'family-3', '砂浜は押しにくいので抱っこひもがおすすめ'),
  ('spot-event', 'family-2', '臨時駐車場あり');

-- #32: 一般社団法人渋川マリンアクティビティ協会向け架空大会デモ（ローカル専用）
INSERT INTO maps (id, owner_id, title, description, published) VALUES
  ('beach-sports-demo', 'user-kanko', '渋川ビーチスポーツ大会（デモ）', '協会の皆さまへの説明用に作成した架空の大会デモマップです。参加者案内・会場設備・開催準備・安全救護を4レイヤーに分けて整理。開催日・募集・設備・許可・安全基準は未確定で、仮置き／要確認です。', 1);
INSERT INTO layers (map_id, id, name, sort_order) VALUES
  ('beach-sports-demo', 'participants', '参加者向け（仮）', 0),
  ('beach-sports-demo', 'access', '会場・周辺設備', 1),
  ('beach-sports-demo', 'operations', '開催準備・当日運営（検討用）', 2),
  ('beach-sports-demo', 'safety', '安全・救護（検討用）', 3);
INSERT INTO spots (map_id, id, name, description, lat, lng, start_date, end_date) VALUES
  ('beach-sports-demo', 'bs-event', '渋川ビーチスポーツ大会（架空デモ）', 'Event Prep をもとにした参加者案内の見本。種目、対象、募集、参加費、開催日程はいずれも架空の仮置きです。掲載期間は期間表示のデモ用で、実際の開催日ではありません。', 34.4536, 133.904, '2026-10-23', '2026-10-25'),
  ('beach-sports-demo', 'bs-venue', '渋川海岸（開催候補地・区画確認）', '開催候補地を示す概略ピン。利用許可・使用区画・設営物・一般利用者との動線が決まるまでは開催場所として確定しません。', 34.4539, 133.9047, NULL, NULL),
  ('beach-sports-demo', 'bs-toilet', '渋川公園（トイレ）', '玉野市案内に掲載された周辺施設。大会時の利用可否、開放時間、会場からの経路・距離は未確認です。', 34.4547, 133.9065, NULL, NULL),
  ('beach-sports-demo', 'bs-parking', '渋川観光駐車場（市営）', '渋川海岸に隣接する市営駐車場。通常の料金・収容台数と、大会当日の利用可否・空き・団体利用を分けて案内します。', 34.4548, 133.9057, NULL, NULL),
  ('beach-sports-demo', 'bs-comfort', '給水・休憩・更衣（設置検討）', '給水、日陰、休憩、シャワー、更衣の候補を検討するための仮スポット。設備が実在・利用可能と示すものではありません。', 34.4537, 133.9044, NULL, NULL),
  ('beach-sports-demo', 'bs-safety', '救護・AED・緊急車両動線（配置検討）', '救護担当、救急箱、最寄り AED、119 通報時の住所・進入路・集合場所を確認するための運営用仮スポット。', 34.4538, 133.9045, NULL, NULL),
  ('beach-sports-demo', 'bs-operations', '受付・用具・案内（配置検討）', '受付、参加者管理、案内掲示、用具の搬入・固定・保管・設営撤去、ごみ対応を確認するための仮スポット。', 34.454, 133.9048, NULL, NULL);
INSERT INTO spot_layers (spot_id, layer_id) VALUES
  ('bs-event', 'participants'),
  ('bs-event', 'operations'),
  ('bs-venue', 'access'),
  ('bs-venue', 'operations'),
  ('bs-venue', 'safety'),
  ('bs-toilet', 'participants'),
  ('bs-toilet', 'access'),
  ('bs-parking', 'participants'),
  ('bs-parking', 'access'),
  ('bs-comfort', 'participants'),
  ('bs-comfort', 'access'),
  ('bs-comfort', 'operations'),
  ('bs-safety', 'safety'),
  ('bs-safety', 'operations'),
  ('bs-operations', 'operations');
INSERT INTO layer_fields (id, layer_id, name) VALUES
  ('bs-p-01', 'participants', '種目・対象'),
  ('bs-p-02', 'participants', '申込・定員・参加費'),
  ('bs-p-03', 'participants', '開催日時・予備日'),
  ('bs-p-04', 'participants', '持ち物・貸出'),
  ('bs-p-05', 'participants', '設備・アクセス案内'),
  ('bs-p-06', 'participants', '中止・参加者連絡'),
  ('bs-a-01', 'access', 'トイレ・バリアフリー'),
  ('bs-a-02', 'access', '駐車場の通常情報'),
  ('bs-a-03', 'access', '当日利用・会場までの動線'),
  ('bs-a-04', 'access', 'シャワー・更衣'),
  ('bs-a-05', 'access', '給水・日陰・休憩'),
  ('bs-o-01', 'operations', '利用許可・手続き'),
  ('bs-o-02', 'operations', '使用区画・一般利用者との調整'),
  ('bs-o-03', 'operations', '受付・参加者管理'),
  ('bs-o-04', 'operations', '用具・安全な設営撤去'),
  ('bs-o-05', 'operations', '周知・ごみ対応'),
  ('bs-o-06', 'operations', '掲載期間デモの注意'),
  ('bs-s-01', 'safety', '救護・AED・緊急車両'),
  ('bs-s-02', 'safety', '気象・海況・暑さの中止基準'),
  ('bs-s-03', 'safety', '保険・同意・未成年者対応');
INSERT INTO spot_field_values (spot_id, field_id, value) VALUES
  ('bs-event', 'bs-p-01', '仮案：初心者向けビーチバレー／ビーチサッカー体験。対象年齢・参加条件・実施種目は協会確認前。'),
  ('bs-event', 'bs-p-02', '仮案：事前申込・参加費無料。定員、申込先、参加費、当日受付方法は未定。'),
  ('bs-event', 'bs-p-03', '開催日時・予備日とも未定。季節、潮位、気象、近隣行事、会場利用可否を確認して協会が決める。'),
  ('bs-event', 'bs-p-04', '仮案：運動できる服、飲料、帽子、日焼け対策。裸足／靴の可否、用具貸出は確認前。'),
  ('bs-event', 'bs-p-06', '仮案：雷・強風・高波／警報・暑さ・避難情報を確認して判断。判断者・基準・連絡先・告知時刻は協会と管理者が決定。'),
  ('bs-event', 'bs-o-03', '受付方法、定員、参加者名簿の扱い、当日連絡先、欠席・中止時の連絡手段を協会決定後に記載。個人情報の管理方法も確認。'),
  ('bs-event', 'bs-o-06', 'マップ上の掲載期間 2026-10-23〜25 は期間表示・自動非表示の操作デモ用。実際の開催日程ではない。'),
  ('bs-venue', 'bs-o-01', '【要確認】海岸利用・占用・届出の要否、使用区画、設営物・看板の許可先と申請期限を確認。許可前に開催確定として告知しない。'),
  ('bs-venue', 'bs-o-02', '【現地下見】競技範囲、一般利用者との距離、観覧・受付の配置、救急車の動線、避難場所を決める。'),
  ('bs-venue', 'bs-s-02', '海岸の波・風・雷・警報・暑さ指数・避難情報を誰がいつ確認するか、開催・中断・中止の判断者と基準を決める。'),
  ('bs-venue', 'bs-s-01', '救護所・AED・救急車の配置は未決定。会場住所、進入路、集合場所、避難先の現地確認後に安全情報へ反映。'),
  ('bs-toilet', 'bs-a-01', '市案内：渋川公園に男女別トイレ（小便器・和式・洋式）。バリアフリー対応・開放時間・イベント当日の利用可否は要確認。'),
  ('bs-toilet', 'bs-a-03', '会場からの距離、夜間やイベント時の開放、利用できる入口、車いすで通れる経路を施設管理者と現地で確認。'),
  ('bs-toilet', 'bs-p-05', '周辺トイレの場所は市案内を参照。イベント時の利用可否・開放時間と、車いすでの経路は施設管理者に要確認。'),
  ('bs-parking', 'bs-a-02', '玉野市案内（2026-04-20更新）：24時間・493台（普通車429、身障者用8、大型バス9、自動二輪47）。1時間100円、1日上限1,000円。'),
  ('bs-parking', 'bs-a-03', '通常の収容台数は大会当日の空きや団体利用枠を保証しない。会場までの安全な徒歩経路、バス乗降、車いす動線を要確認。'),
  ('bs-parking', 'bs-p-05', '市営駐車場は有料。料金・利用方法は公式案内を参照し、大会当日の空き・団体利用・会場までの経路は別途確認。'),
  ('bs-comfort', 'bs-a-04', '利用できるシャワー・更衣場所は未確認。場所、利用時間、料金、イベント利用可否を施設へ確認し、確認できなければ参加案内に載せない。'),
  ('bs-comfort', 'bs-a-05', '給水設備、飲料の販売、水場、日陰、休憩場所は未確認。飲料持参を仮案とし、テント設営は管理者の許可を確認。'),
  ('bs-comfort', 'bs-p-05', 'シャワー・更衣の利用可否は未確認。給水・日陰・休憩場所も確認して、使える設備だけ参加者へ案内する。'),
  ('bs-comfort', 'bs-o-02', '休憩・給水場所とテントの設置可否、競技範囲や一般利用者の通行を妨げない配置を管理者と確認。'),
  ('bs-safety', 'bs-s-01', '救護担当・救急箱・最寄りAED・119通報時の住所・救急車の進入路と集合場所を現地下見で確認。現在のピンは配置場所を示さない。'),
  ('bs-safety', 'bs-s-02', '雷・風・波浪・警報・暑さ指数・避難情報の確認担当、数値基準、判断者、中断後の再開条件、参加者への連絡手段を決める。'),
  ('bs-safety', 'bs-s-03', '傷害・賠償保険、参加規約、保護者同意、未成年者の見守り、撮影可否を協会で決めて申込時に案内する。'),
  ('bs-operations', 'bs-o-04', 'ネット・ゴール・ボール等の用具、砂上で安全に固定する方法、搬入・保管・設営・撤去を管理者と確認。許可のない杭打ちはしない。'),
  ('bs-operations', 'bs-o-03', '受付場所・列の作り方、定員確認、参加者名簿、当日の問い合わせ先、遅刻や欠席への対応を協会決定後に記載。'),
  ('bs-operations', 'bs-o-05', '会場案内と一般利用者への事前周知、掲示物の許可、ごみの回収・持ち帰り・分別を決める。');
