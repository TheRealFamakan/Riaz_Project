const bcrypt = require('bcryptjs');
const { User } = require('./models');
const sequelize = require('./config/database');

async function checkAndFixAdmin() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // Find the user
        const user = await User.findOne({ where: { email: 'camarafamakan2@gmail.com' } });

        if (!user) {
            console.log('❌ User not found! Creating new admin...');

            // Create new admin
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Thereal15699', salt);

            const newAdmin = await User.create({
                name: 'Admin Camara',
                email: 'camarafamakan2@gmail.com',
                password: hashedPassword,
                phone: '+212600000000',
                role: 'admin',
                verified: true,
                address: 'Morocco'
            });

            console.log('✅ Admin created successfully!');
            console.log('Email:', newAdmin.email);
            console.log('Role:', newAdmin.role);
        } else {
            console.log('✅ User found!');
            console.log('Email:', user.email);
            console.log('Role:', user.role);
            console.log('Verified:', user.verified);

            // Test password
            const testPassword = 'Thereal15699';
            const isMatch = await bcrypt.compare(testPassword, user.password);
            console.log('Password test:', isMatch ? '✅ CORRECT' : '❌ INCORRECT');

            if (!isMatch) {
                console.log('\n🔧 Updating password...');
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(testPassword, salt);
                user.role = 'admin';
                user.verified = true;
                await user.save();
                console.log('✅ Password and role updated!');
            }

            if (user.role !== 'admin') {
                user.role = 'admin';
                user.verified = true;
                await user.save();
                console.log('✅ Role updated to admin!');
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: camarafamakan2@gmail.com');
        console.log('🔑 Password: Thereal15699');
        console.log('👤 Role: admin');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkAndFixAdmin();
