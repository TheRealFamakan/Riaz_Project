const bcrypt = require('bcryptjs');
const { User } = require('./models');
const sequelize = require('./config/database');

async function createCustomAdmin() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email: 'camarafamakan2@gmail.com' } });

        if (existingUser) {
            console.log('⚠️  User already exists!');
            console.log('Email:', existingUser.email);
            console.log('Current Role:', existingUser.role);

            // Update to admin role
            existingUser.role = 'admin';
            existingUser.verified = true;
            await existingUser.save();
            console.log('✅ User updated to admin role');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📧 Email: camarafamakan2@gmail.com');
            console.log('🔑 Password: (unchanged)');
            console.log('👤 Role: admin');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Thereal15699', salt);

        // Create admin user
        const admin = await User.create({
            name: 'Admin',
            email: 'camarafamakan2@gmail.com',
            password: hashedPassword,
            phone: '+212600000000',
            role: 'admin',
            verified: true,
            address: 'Morocco'
        });

        console.log('✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: camarafamakan2@gmail.com');
        console.log('🔑 Password: Thereal15699');
        console.log('👤 Role: admin');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🎯 You can now login with these credentials!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createCustomAdmin();
