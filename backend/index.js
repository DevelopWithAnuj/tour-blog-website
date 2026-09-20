import app from './app.js'
import connectDB from './db/db-connection.js';
import { Config } from './utils/constants.js';

connectDB()
  .then(() => {
    app.listen(Config.PORT, Config.HOST, () => {
      console.log(
        `Backend app listening on port http://${Config.HOST}:${Config.PORT}`
    );
  });
  })
  .catch((err) => {
    console.error('MongoDB connection error', err);
    process.exit(1);
});
