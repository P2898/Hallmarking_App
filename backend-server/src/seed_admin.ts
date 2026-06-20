import { connectDB } from './db';
import { User } from './models';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  await connectDB();
  
  const email = 'Waqar@nchgroup.in';
  const password = 'nch@waqar21';
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  let adminUser = await User.findOne({ where: { email } });
  
  if (adminUser) {
    adminUser.password = hashedPassword;
    adminUser.role = 'admin';
    await adminUser.save();
    console.log('✅ Admin user updated!');
  } else {
    adminUser = await User.create({
      email,
      password: hashedPassword,
      displayName: 'Waqar NCH',
      role: 'admin',
    });
    console.log('✅ Admin user created!');
  }
  
  process.exit(0);
}

seedAdmin();
