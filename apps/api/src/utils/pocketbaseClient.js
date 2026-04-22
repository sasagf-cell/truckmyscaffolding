import dotenv from 'dotenv';
dotenv.config();
import Pocketbase from 'pocketbase';

const pocketbaseClient = new Pocketbase(process.env.POCKETBASE_URL || 'http://localhost:8090');

async function connectToPocketBase() {
  for (let i = 0; i < 5; i++) {
    try {
      await pocketbaseClient.collection('_superusers').authWithPassword(
          process.env.PB_SUPERUSER_EMAIL,
          process.env.PB_SUPERUSER_PASSWORD,
      );
      console.log("Successfully connected to PocketBase via API");
      return;
    } catch (error) {
      console.warn(`Failed to connect to PocketBase, retrying in 2 seconds... (Attempt ${i + 1}/5)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

await connectToPocketBase();

export default pocketbaseClient;

export { pocketbaseClient };
