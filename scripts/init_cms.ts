import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ethicalSourcingImage = 'https://images.unsplash.com/photo-1596752002341-2a6c1e549da7?q=80&w=2070&auto=format&fit=crop';

async function main() {
  console.log('Updating CMS data...');
  
  // Update about_story
  await setDoc(doc(db, 'cms', 'about_story'), {
    title: 'Where Tradition Meets Transformation',
    subtitle: '"Craftifue was born from a simple observation: the incredible talent of local artisans was often hidden from the world."',
    storyHeading: 'Ethical Sourcing & Heritage',
    storyParagraph1: 'Our journey begins in the heart of rural India, where we source sustainable materials directly from artisan clusters. By cutting out middlemen, we ensure that every rupee goes towards preserving ancient crafts and supporting local families.',
    storyParagraph2: 'From the bamboo groves of the North East to the brass workshops of Central India, we prioritize ethical practices, fair wages, and natural materials that respect both the artisan and the environment.',
    mainImage: ethicalSourcingImage,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  console.log('CMS data updated successfully!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
