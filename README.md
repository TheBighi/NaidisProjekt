## Init backend

```
npm i
node index.js
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