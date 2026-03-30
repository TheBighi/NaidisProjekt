## Init backend

```
npm i
node index.js

npx sequelize-cli db:migrate
npx sequelize-cli db:migrate:undo:all

npx sequelize-cli db:seed:undo:all
npx sequelize-cli db:seed:all
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