-- デモ用の初期データ（ローカル: pnpm db:seed）。中身は #32 のスプレッドシートで差し替える
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
  ('spot-beach', 'shibukawa', '渋川海岸', '遠浅で穏やかな海水浴場。', 34.5689, 133.8895, NULL, NULL),
  ('spot-ojigatake', 'shibukawa', '王子が岳', '瀬戸内海を一望できる展望スポット。', 34.5636, 133.9047, NULL, NULL),
  ('spot-event', 'shibukawa', 'ビーチイベント', '週末限定の臨時スポット。', 34.5695, 133.8880, '2026-01-01', '2099-12-31'),
  ('spot-cafe', 'demo-cafe', '海辺のカフェ', '', 34.5680, 133.8900, NULL, NULL);

INSERT INTO spot_layers (spot_id, layer_id) VALUES
  ('spot-beach', 'family'),
  ('spot-beach', 'date'),
  ('spot-ojigatake', 'date'),
  ('spot-event', 'family');
