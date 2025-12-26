-- Create profiles table for farmer data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_name TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Create recommendations history table
CREATE TABLE public.recommendations_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  location TEXT NOT NULL,
  soil_ph NUMERIC NOT NULL,
  fertilizer_level TEXT NOT NULL,
  irrigation_needed BOOLEAN NOT NULL,
  recommendations_text TEXT,
  weather_temperature NUMERIC,
  weather_humidity NUMERIC,
  weather_rainfall NUMERIC,
  soil_moisture NUMERIC,
  confidence NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on recommendations_history
ALTER TABLE public.recommendations_history ENABLE ROW LEVEL SECURITY;

-- Recommendations history policies
CREATE POLICY "Users can view their own recommendations" 
ON public.recommendations_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recommendations" 
ON public.recommendations_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recommendations" 
ON public.recommendations_history FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, farmer_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'farmer_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for profile timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();