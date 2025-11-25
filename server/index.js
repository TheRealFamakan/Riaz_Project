const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
require('./models');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000; // Render va nous donner un PORT automatiquement

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/hairdressers', require('./routes/hairdressers'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => {
    res.send('MyHairCut API is running');
});

// Database Connection & Server Start
sequelize.authenticate()
    .then(() => {
        console.log('PostgreSQL Connected');
        return sequelize.sync({ alter: true });
    })
    .then(() => {
        console.log('Database synced');
        // ON LANCE LE SERVEUR DANS TOUS LES CAS
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => console.log('Database Connection Error:', err));
