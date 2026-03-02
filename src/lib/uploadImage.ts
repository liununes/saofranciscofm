import { supabase } from '@/integrations/supabase/client';

export const uploadImage = async (file: File, folder: string = 'general'): Promise<string | null> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { error } = await supabase.storage
    .from('radio-assets')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  const { data } = supabase.storage.from('radio-assets').getPublicUrl(fileName);
  return data.publicUrl;
};

export const deleteImage = async (url: string): Promise<void> => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/radio-assets/');
    if (pathParts.length > 1) {
      await supabase.storage.from('radio-assets').remove([pathParts[1]]);
    }
  } catch {
    // ignore
  }
};
