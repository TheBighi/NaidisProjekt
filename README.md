## Init backend

```
npm i
node server.js

npx sequelize-cli db:migrate
npx sequelize-cli db:migrate:undo:all

npx sequelize-cli db:seed:undo:all
npx sequelize-cli db:seed:all

npm run test (testib kuidas server reageerib kui JSON impordis on valed andmed ja või duplikaadid ja testib ka /api/readings vastust kui on vale date input)
```

## Init frontend
```
npm i
npm run dev
```
## SQL User setup
```
CREATE database NaidisProjekt;

CREATE USER 'bigi'@'127.0.0.1' IDENTIFIED BY 'qwerty';
GRANT ALL PRIVILEGES ON NaidisProjekt.* TO 'bigi'@'127.0.0.1';
FLUSH PRIVILEGES;
```