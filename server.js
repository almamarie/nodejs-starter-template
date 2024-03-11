require('dotenv').config();
const sequelize = require('./src/databases/sequelize');
const User = require('./src/models/user.model.js');
const logger = require('./src/logs/logger');

const app = require('./src/app.js');
const PORT = process.env.PORT;

sequelize
  .sync()
  // .sync({ force: true })
  .then(() => {
    logger.info('Database connected.');
    app.listen(PORT, () => {
      logger.info(`server running at port: ${PORT}`);
      logger.info('Press CTRL + C to stop server');
    });
  });
