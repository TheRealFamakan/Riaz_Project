const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
require('./models');
require('dotenv').config();

const app = express();

// Configuration CORS pour accepter votre Frontend Vercel
app.use(cors({
    origin: '*', // Pour l'instant on accepte tout le monde pour tester
    credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/hairdressers', require('./routes/hairdressers'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => {
    res.send('MyHairCut API is running on Vercel!');
});

// Connexion DB (Sans sync bloquant pour le serverless)
// En serverless, on évite sequelize.sync() à chaque requête car c'est lent.
// On suppose que la DB est prête.
sequelize.authenticate()
    .then(() => console.log('PostgreSQL Connected'))
    .catch(err => console.log('Database Connection Error:', err));

// IMPORTANT POUR VERCEL :
// On n'utilise app.listen QUE si on est en local sur votre PC.
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running locally on port ${PORT}`);
    });
}

// Export indispensable pour Vercel
module.exports = app;
