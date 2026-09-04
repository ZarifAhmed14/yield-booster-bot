import { supabase } from '@/integrations/supabase/client';

export async function enablePush(userId: string, language: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) throw new Error('unsupported');
  if (await Notification.requestPermission() !== 'granted') throw new Error('permission');
  const {data: key, error} = await supabase.from('push_public_config').select('public_key').single();
  if (error || !key) throw new Error('configuration');
  const registration = await Promise.race([navigator.serviceWorker.ready, new Promise<never>((_, reject) => setTimeout(() => reject(new Error('worker')), 15000))]);
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    const bytes = Uint8Array.from(atob(key.public_key.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    subscription = await registration.pushManager.subscribe({userVisibleOnly: true, applicationServerKey: bytes});
  }
  const value = subscription.toJSON();
  const {error: saveError} = await supabase.from('push_subscriptions').upsert({user_id: userId, endpoint: subscription.endpoint, p256dh: value.keys!.p256dh, auth: value.keys!.auth, language}, {onConflict: 'endpoint'});
  if (saveError) throw saveError;
}
export async function disablePush(userId: string) {
  const registration = await navigator.serviceWorker?.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;
  const {error} = await supabase.from('push_subscriptions').delete().eq('user_id', userId).eq('endpoint', subscription.endpoint);
  if (error) throw error;
  await subscription.unsubscribe();
}
