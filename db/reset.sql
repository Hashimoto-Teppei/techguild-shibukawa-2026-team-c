-- ローカル DB を空にする（pnpm db:reset から使う）
DROP TABLE IF EXISTS spot_layers;
DROP TABLE IF EXISTS spots;
DROP TABLE IF EXISTS layers;
DROP TABLE IF EXISTS maps;
DROP TABLE IF EXISTS verification;
DROP TABLE IF EXISTS account;
DROP TABLE IF EXISTS session;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS d1_migrations;
