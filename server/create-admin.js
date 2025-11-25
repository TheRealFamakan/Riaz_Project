const bcrypt = require('bcryptjs');
const { User } = require('./models');
const sequelize = require('./config/database');

async function createAdminUser() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ where: { email: 'admin@myhaircut.com' } });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log('Email: admin@myhaircut.com');
            console.log('Role:', existingAdmin.role);

            // Update to admin role if not already
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                existingAdmin.verified = true;
                await existingAdmin.save();
                console.log('✅ User updated to admin role');
            }

            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Create admin user
        const admin = await User.create({
            name: 'Admin MyHairCut',
            email: 'admin@myhaircut.com',
            password: hashedPassword,
            phone: '+212600000000',
            role: 'admin',
            verified: true,
            address: 'Casablanca, Morocco'
        });

        console.log('✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: admin@myhaircut.com');
        console.log('🔑 Password: admin123');
        console.log('👤 Role: admin');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🎯 You can now login with these credentials!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createAdminUser();
