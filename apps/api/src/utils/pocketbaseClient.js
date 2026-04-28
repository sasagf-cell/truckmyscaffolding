import dotenv from 'dotenv';
dotenv.config();
import Pocketbase from 'pocketbase';

const pocketbaseClient = new Pocketbase(process.env.POCKETBASE_URL || 'http://localhost:8090');

async function authWithSuperuser() {
  await pocketbaseClient.collection('_superusers').authWithPassword(
    process.env.PB_SUPERUSER_EMAIL,
    process.env.PB_SUPERUSER_PASSWORD,
  );
}

async function connectToPocketBase() {
  for (let i = 0; i < 5; i++) {
    try {
      await authWithSuperuser();
      console.log("Successfully connected to PocketBase via API");
      // Auto-refresh every 4 min — token expires at 5 min
      setInterval(async () => {
        try {
          await authWithSuperuser();
        } catch (e) {
          console.warn('PocketBase token refresh failed:', e.message);
        }
      }, 4 * 60 * 1000);
      return;
    } catch (error) {
      console.warn(`Failed to connect to PocketBase, retrying in 2 seconds... (Attempt ${i + 1}/5)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  console.error('Could not connect to PocketBase after 5 attempts');
}

await connectToPocketBase();

export default pocketbaseClient;

export { pocketbaseClient };
