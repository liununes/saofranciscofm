-- Fonte reserva de streaming para a São Francisco FM.
-- A fonte principal não é alterada por esta migração.

ALTER TABLE public.radio_config
  ADD COLUMN IF NOT EXISTS streaming_url_backup TEXT,
  ADD COLUMN IF NOT EXISTS streaming_backup_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS streaming_failover_mode TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS streaming_active_source TEXT NOT NULL DEFAULT 'primary';

UPDATE public.radio_config
SET streaming_url_backup = COALESCE(streaming_url_backup, 'http://streaming.liurecord.com.br:8015/'),
    streaming_backup_enabled = COALESCE(streaming_backup_enabled, false),
    streaming_failover_mode = CASE
      WHEN streaming_failover_mode IN ('manual', 'automatic') THEN streaming_failover_mode
      ELSE 'manual'
    END,
    streaming_active_source = CASE
      WHEN streaming_active_source IN ('primary', 'backup') THEN streaming_active_source
      ELSE 'primary'
    END;

ALTER TABLE public.radio_config
  DROP CONSTRAINT IF EXISTS radio_config_streaming_failover_mode_check,
  DROP CONSTRAINT IF EXISTS radio_config_streaming_active_source_check,
  ADD CONSTRAINT radio_config_streaming_failover_mode_check
    CHECK (streaming_failover_mode IN ('manual', 'automatic')),
  ADD CONSTRAINT radio_config_streaming_active_source_check
    CHECK (streaming_active_source IN ('primary', 'backup'));

COMMENT ON COLUMN public.radio_config.streaming_url_backup IS 'URL opcional da fonte reserva do streaming.';
COMMENT ON COLUMN public.radio_config.streaming_backup_enabled IS 'Permite que a fonte reserva seja usada manualmente ou no failover automático.';
COMMENT ON COLUMN public.radio_config.streaming_failover_mode IS 'manual mantém a fonte escolhida; automatic troca para outra fonte quando houver erro.';
COMMENT ON COLUMN public.radio_config.streaming_active_source IS 'Fonte escolhida no painel: primary ou backup.';
