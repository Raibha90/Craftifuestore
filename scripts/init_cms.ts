import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ethicalSourcingImage = 'https://images.unsplash.com/photo-1596752002341-2a6c1e549da7?q=80&w=2070&auto=format&fit=crop';

async function main() {
  console.log('Starting CMS update...');
  try {
    const homeDoc = doc(db, 'cms', 'home');
    console.log('Sending cms/home update...');
    await setDoc(homeDoc, {
      craftingSteps: [
        {
          title: "Ethical Sourcing",
          desc: "We handpick sustainable bamboo and pure brass directly from rural artisan clusters who share our ethics.",
          img: ethicalSourcingImage
        },
        {
          title: "Master Weaving",
          desc: "Skilled artisans spend days weaving intricate patterns using age-old traditional techniques passed down generations.",
          img: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=2031&auto=format&fit=crop"
        },
        {
          title: "Natural Finishing",
          desc: "Each piece is polished using natural plant-based oils and non-toxic finishes for a healthy, timeless glow.",
          img: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=1974&auto=format&fit=crop"
        },
        {
          title: "Quality Check",
          desc: "Every treasure undergoes a rigorous quality check to ensure it meets our heritage standards before shipping.",
          img: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1974&auto=format&fit=crop"
        }
      ],
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('cms/home updated.');

    const aboutDoc = doc(db, 'cms', 'about_story');
    console.log('Sending cms/about_story update...');
    await setDoc(aboutDoc, {
      title: 'Where Tradition Meets Transformation',
      subtitle: '"Cratifue was born from a simple observation: the incredible talent of local artisans was often hidden from the world."',
      storyHeading: 'Ethical Sourcing & Heritage',
      storyParagraph1: 'Our journey begins in the heart of rural India, where we source sustainable materials directly from artisan clusters. By cutting out middlemen, we ensure that every rupee goes towards preserving ancient crafts and supporting local families.',
      storyParagraph2: 'From the bamboo groves of the North East to the brass workshops of Central India, we prioritize ethical practices, fair wages, and natural materials that respect both the artisan and the environment.',
      mainImage: ethicalSourcingImage,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('cms/about_story updated.');

    // Initialize settings to prevent frontend crashes
    console.log('Initializing settings...');
    await setDoc(doc(db, 'settings', 'general'), {
      storeName: 'Artisan Treasures',
      contactEmail: 'contact@craftifue.store',
      logoUrl: '/regenerated_image_1777410191797.png'
    }, { merge: true });
    
    await setDoc(doc(db, 'settings', 'appearance'), {
      topBarMessage: 'Free Shipping on Handcrafted Treasures Over ₹2000',
      headerAlert: 'Authentic Artisan Heritage'
    }, { merge: true });
    console.log('Settings initialized.');

    console.log('CMS data updated successfully!');
  } catch (e) {
    console.error('Error during update:', e);
  } finally {
    console.log('Exiting...');
    process.exit(0);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
