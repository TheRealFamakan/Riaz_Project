const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'myhaircut',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASS || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: console.log
    }
);

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL connection successful!');
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Unable to connect to PostgreSQL:');
        console.error(error.message);
        console.error('\nPlease check:');
        console.error('1. PostgreSQL is running');
        console.error('2. Database credentials in .env are correct');
        console.error('3. Database "myhaircut" exists (or will be created)');
        process.exit(1);
    }
}

testConnection();
