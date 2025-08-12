-- Create buckets (idempotent)
DO $$ BEGIN
  INSERT INTO storage.buckets (id, name, public) VALUES ('vtt-assets', 'vtt-assets', true);
EXCEPTION WHEN unique_violation THEN NULL; END $$;

DO $$ BEGIN
  INSERT INTO storage.buckets (id, name, public) VALUES ('models', 'models', true);
EXCEPTION WHEN unique_violation THEN NULL; END $$;

-- Policies for vtt-assets (idempotent creation)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read vtt-assets'
  ) THEN
    CREATE POLICY "Public read vtt-assets"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'vtt-assets');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated insert vtt-assets'
  ) THEN
    CREATE POLICY "Authenticated insert vtt-assets"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'vtt-assets' AND auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated update vtt-assets'
  ) THEN
    CREATE POLICY "Authenticated update vtt-assets"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'vtt-assets' AND auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated delete vtt-assets'
  ) THEN
    CREATE POLICY "Authenticated delete vtt-assets"
    ON storage.objects
    FOR DELETE
    USING (bucket_id = 'vtt-assets' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- Policies for models bucket (keep compatibility with existing code)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read models'
  ) THEN
    CREATE POLICY "Public read models"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'models');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated insert models'
  ) THEN
    CREATE POLICY "Authenticated insert models"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'models' AND auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated update models'
  ) THEN
    CREATE POLICY "Authenticated update models"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'models' AND auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated delete models'
  ) THEN
    CREATE POLICY "Authenticated delete models"
    ON storage.objects
    FOR DELETE
    USING (bucket_id = 'models' AND auth.role() = 'authenticated');
  END IF;
END $$;