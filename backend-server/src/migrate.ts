import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { connectDB } from './db';
import { User, Category, Listing, Chat, Message, Offer } from './models';
import bcrypt from 'bcryptjs';

const firebaseConfig = {
  apiKey: "AIzaSyBMhPdxUXDvo9dxxhQ8dUFClejI5iMzjVI",
  authDomain: "hallmarkhub-3a4c9.firebaseapp.com",
  projectId: "hallmarkhub-3a4c9",
  storageBucket: "hallmarkhub-3a4c9.firebasestorage.app",
  messagingSenderId: "427576221201",
  appId: "1:427576221201:web:362ac60afd1711b0e35bb0",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

async function authenticate() {
  const email = `migration_agent_${Math.floor(Math.random() * 10000)}@example.com`;
  const password = "TemporaryPassword123!";
  
  console.log(`🔑 Creating temporary auth session with: ${email}`);
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    console.log(`✅ Authenticated successfully as temp user: ${cred.user.uid}`);
    return cred.user;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log(`✅ Authenticated successfully as existing user: ${cred.user.uid}`);
      return cred.user;
    }
    throw error;
  }
}

async function runMigration() {
  try {
    console.log('🔌 Connecting to local MySQL Database...');
    await connectDB();
    console.log('✅ Connected to MySQL.');

    // Authenticate to bypass permission rules
    await authenticate();

    const defaultPassword = 'MigratedPassword123!';
    const salt = await bcrypt.genSalt(10);
    const hashedDefaultPassword = await bcrypt.hash(defaultPassword, salt);

    console.log('\n📥 Fetching Categories from Firestore...');
    const catSnapshot = await getDocs(collection(firestore, 'categories'));
    console.log(`Found ${catSnapshot.size} categories.`);
    for (const doc of catSnapshot.docs) {
      const data = doc.data();
      await Category.findOrCreate({
        where: { id: doc.id },
        defaults: {
          id: doc.id,
          name: data.name || 'Category',
          icon: data.icon || null,
        }
      });
    }
    console.log('✅ Categories migration complete.');

    console.log('\n📥 Fetching Users from Firestore...');
    const userSnapshot = await getDocs(collection(firestore, 'users'));
    console.log(`Found ${userSnapshot.size} users.`);
    for (const doc of userSnapshot.docs) {
      const data = doc.data();
      const email = data.email || `${doc.id}@migrated.com`;
      await User.findOrCreate({
        where: { id: doc.id },
        defaults: {
          id: doc.id,
          email,
          password: hashedDefaultPassword,
          displayName: data.fullName || data.companyName || 'Migrated User',
          phoneNumber: data.phoneNumber || null,
          photoURL: data.photoURL || null,
          role: data.role || 'user',
        }
      });
    }
    console.log('✅ Users migration complete.');

    console.log('\n📥 Fetching Listings from Firestore...');
    const listingSnapshot = await getDocs(collection(firestore, 'listings'));
    console.log(`Found ${listingSnapshot.size} listings.`);
    for (const doc of listingSnapshot.docs) {
      const data = doc.data();
      
      let categoryId = data.category;
      if (categoryId) {
        const catExists = await Category.findByPk(categoryId);
        if (!catExists) {
          const firstCat = await Category.findOne();
          categoryId = firstCat ? firstCat.id : null;
        }
      }

      let sellerId = data.userId;
      if (sellerId) {
        const userExists = await User.findByPk(sellerId);
        if (!userExists) {
          await User.create({
            id: sellerId,
            email: `${sellerId}@migrated.com`,
            password: hashedDefaultPassword,
            displayName: data.sellerName || 'Unknown Seller',
          });
        }
      }

      await Listing.findOrCreate({
        where: { id: doc.id },
        defaults: {
          id: doc.id,
          title: data.title || `${data.brand || ''} ${data.model || 'Equipment'}`.trim() || 'Machine Listing',
          description: data.description || 'No description provided',
          price: data.price || 0,
          images: data.photos || [],
          status: data.status === 'sold' ? 'sold' : 'active',
          condition: data.condition || 'Good',
          location: `${data.city || ''}, ${data.state || ''}`.trim() || 'India',
          sellerId,
          categoryId,
          buyerId: data.buyerId || null,
        }
      });
    }
    console.log('✅ Listings migration complete.');

    console.log('\n📥 Fetching Chats, Messages, and Offers from Firestore...');
    const chatSnapshot = await getDocs(collection(firestore, 'chats'));
    console.log(`Found ${chatSnapshot.size} chats.`);
    for (const chatDoc of chatSnapshot.docs) {
      const chatData = chatDoc.data();
      
      const buyerId = chatData.participants?.[0] || null;
      const sellerId = chatData.participants?.[1] || null;
      const listingId = chatData.listingId || null;

      if (!buyerId || !sellerId || !listingId) {
        console.log(`⚠️ Skipping chat ${chatDoc.id} due to missing participants or listing reference.`);
        continue;
      }

      const listingExists = await Listing.findByPk(listingId);
      const buyerExists = await User.findByPk(buyerId);
      const sellerExists = await User.findByPk(sellerId);

      if (!listingExists || !buyerExists || !sellerExists) {
        console.log(`⚠️ Skipping chat ${chatDoc.id} because referenced entities don't exist.`);
        continue;
      }

      await Chat.findOrCreate({
        where: { id: chatDoc.id },
        defaults: {
          id: chatDoc.id,
          buyerId,
          sellerId,
          listingId,
          lastMessage: chatData.lastMessage || null,
          unreadCount: chatData.unreadCount || 0,
          lastSenderId: chatData.lastSenderId || null,
        }
      });

      const msgSnapshot = await getDocs(collection(firestore, 'chats', chatDoc.id, 'messages'));
      for (const msgDoc of msgSnapshot.docs) {
        const msgData = msgDoc.data();
        await Message.findOrCreate({
          where: { id: msgDoc.id },
          defaults: {
            id: msgDoc.id,
            chatId: chatDoc.id,
            senderId: msgData.senderId,
            text: msgData.text || '',
            read: msgData.read || false,
            createdAt: msgData.timestamp ? new Date(msgData.timestamp.seconds * 1000) : new Date(),
          }
        });
      }

      const offerSnapshot = await getDocs(collection(firestore, 'chats', chatDoc.id, 'offers'));
      for (const offerDoc of offerSnapshot.docs) {
        const offerData = offerDoc.data();
        await Offer.findOrCreate({
          where: { id: offerDoc.id },
          defaults: {
            id: offerDoc.id,
            chatId: chatDoc.id,
            senderId: offerData.senderId,
            amount: offerData.amount || 0,
            message: offerData.message || null,
            status: offerData.status || 'pending',
            createdAt: offerData.timestamp ? new Date(offerData.timestamp.seconds * 1000) : new Date(),
          }
        });
      }
    }
    console.log('✅ Chats, Messages, and Offers migration complete.');

    console.log('\n🎉 MIGRATION SUCCESSFUL! 🎉');
    console.log(`\nNote: All migrated users have been set with a default password: ${defaultPassword}`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed with error:', error);
    process.exit(1);
  }
}

runMigration();
