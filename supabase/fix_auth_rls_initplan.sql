-- =============================================
-- FIX ALL auth_rls_initplan (27 tabelas)
-- Usando abordagem dinâmica segura
-- =============================================

DO $$
DECLARE
  r RECORD;
  new_qual text;
  new_wc text;
  changed boolean;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname, qual, with_check, cmd
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        qual LIKE '%auth.uid()%'
        OR qual LIKE '%auth.role()%'
        OR qual LIKE '%current_setting%'
        OR with_check LIKE '%auth.uid()%'
        OR with_check LIKE '%auth.role()%'
        OR with_check LIKE '%current_setting%'
      )
  LOOP
    changed := false;
    new_qual := r.qual;
    new_wc := r.with_check;

    -- Corrigir qual (USING)
    IF new_qual IS NOT NULL AND (
      new_qual LIKE '%auth.uid()%' OR new_qual LIKE '%auth.role()%' OR new_qual LIKE '%current_setting%'
    ) THEN
      IF new_qual NOT LIKE '%(select auth.uid())%' AND new_qual LIKE '%auth.uid()%' THEN
        new_qual := replace(new_qual, 'auth.uid()', '(select auth.uid())');
        changed := true;
      END IF;
      IF new_qual NOT LIKE '%(select auth.role())%' AND new_qual LIKE '%auth.role()%' THEN
        new_qual := replace(new_qual, 'auth.role()', '(select auth.role())');
        changed := true;
      END IF;
      IF new_qual LIKE '%current_setting%' AND new_qual NOT LIKE '%(select current_setting%' THEN
        new_qual := replace(new_qual, 'current_setting(', '(select current_setting(');
        new_qual := replace(new_qual, '(select current_setting(request.jwt.claims, true), ''role''))', '(select current_setting(''request.jwt.claims'', true), ''role''))');
        changed := true;
      END IF;
    END IF;

    -- Corrigir with_check (WITH CHECK)
    IF new_wc IS NOT NULL AND (
      new_wc LIKE '%auth.uid()%' OR new_wc LIKE '%auth.role()%' OR new_wc LIKE '%current_setting%'
    ) THEN
      IF new_wc NOT LIKE '%(select auth.uid())%' AND new_wc LIKE '%auth.uid()%' THEN
        new_wc := replace(new_wc, 'auth.uid()', '(select auth.uid())');
        changed := true;
      END IF;
      IF new_wc NOT LIKE '%(select auth.role())%' AND new_wc LIKE '%auth.role()%' THEN
        new_wc := replace(new_wc, 'auth.role()', '(select auth.role())');
        changed := true;
      END IF;
    END IF;

    IF changed THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);

      CASE r.cmd
        WHEN 'ALL' THEN
          IF new_wc IS NOT NULL THEN
            EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING (%s) WITH CHECK (%s)',
              r.policyname, r.schemaname, r.tablename, new_qual, new_wc);
          ELSE
            EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING (%s)',
              r.policyname, r.schemaname, r.tablename, new_qual);
          END IF;
        WHEN 'SELECT' THEN
          EXECUTE format('CREATE POLICY %I ON %I.%I FOR SELECT USING (%s)',
            r.policyname, r.schemaname, r.tablename, new_qual);
        WHEN 'INSERT' THEN
          EXECUTE format('CREATE POLICY %I ON %I.%I FOR INSERT WITH CHECK (%s)',
            r.policyname, r.schemaname, r.tablename, COALESCE(new_wc, new_qual));
        WHEN 'UPDATE' THEN
          IF new_wc IS NOT NULL THEN
            EXECUTE format('CREATE POLICY %I ON %I.%I FOR UPDATE USING (%s) WITH CHECK (%s)',
              r.policyname, r.schemaname, r.tablename, new_qual, new_wc);
          ELSE
            EXECUTE format('CREATE POLICY %I ON %I.%I FOR UPDATE USING (%s)',
              r.policyname, r.schemaname, r.tablename, new_qual);
          END IF;
        WHEN 'DELETE' THEN
          EXECUTE format('CREATE POLICY %I ON %I.%I FOR DELETE USING (%s)',
            r.policyname, r.schemaname, r.tablename, new_qual);
      END CASE;

      RAISE NOTICE 'FIXED: %.%', r.schemaname, r.tablename;
    END IF;
  END LOOP;
END $$;
