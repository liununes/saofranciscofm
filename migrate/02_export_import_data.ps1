# ============================================================
# SCRIPT DE MIGRAÇÃO DE DADOS - Supabase Cloud → VPS
# Execute no PowerShell após rodar o schema no VPS
# ============================================================

# === CREDENCIAIS ===
# Configure these variables in the shell before running the migration.
# The VPS key must be a service-role key and must never be committed.
$CLOUD_URL = $env:SAO_CLOUD_SUPABASE_URL
$CLOUD_KEY = $env:SAO_CLOUD_SUPABASE_KEY
$VPS_URL = $env:SAO_VPS_SUPABASE_URL
$VPS_KEY = $env:SAO_VPS_SUPABASE_SERVICE_KEY

$requiredCredentials = @{
    "SAO_CLOUD_SUPABASE_URL" = $CLOUD_URL
    "SAO_CLOUD_SUPABASE_KEY" = $CLOUD_KEY
    "SAO_VPS_SUPABASE_URL" = $VPS_URL
    "SAO_VPS_SUPABASE_SERVICE_KEY" = $VPS_KEY
}
foreach ($credential in $requiredCredentials.GetEnumerator()) {
    if ([string]::IsNullOrWhiteSpace($credential.Value)) {
        throw "Defina a variável de ambiente $($credential.Key) antes de executar este script."
    }
}

$cloudHeaders = @{ "apikey" = $CLOUD_KEY; "Authorization" = "Bearer $CLOUD_KEY" }
$vpsHeaders   = @{ "apikey" = $VPS_KEY;   "Authorization" = "Bearer $VPS_KEY"; "Content-Type" = "application/json" }

# === FUNÇÕES ===

function Get-CloudData {
    param([string]$table, [string]$select = "*", [string]$order = "", [int]$limit = 0)
    $url = "$CLOUD_URL/rest/v1/$table?select=$select"
    if ($order) { $url += "&order=$order" }
    if ($limit -gt 0) { $url += "&limit=$limit" }
    try {
        return Invoke-RestMethod -Uri $url -Headers $cloudHeaders -Method GET
    } catch {
        Write-Host "  [ERRO] Falha ao ler $table : $($_.Exception.Message)" -ForegroundColor Red
        return @()
    }
}

function Send-VpsData {
    param([string]$table, [object]$data)
    $url = "$VPS_URL/rest/v1/$table"
    $body = $data | ConvertTo-Json -Depth 10 -Compress
    try {
        $result = Invoke-WebRequest -Uri $url -Headers $vpsHeaders -Method POST -Body $body -StatusCodeVariable "sc"
        if ($sc -eq 201 -or $sc -eq 200) {
            Write-Host "  [OK] $table - $($data.Count) registros inseridos" -ForegroundColor Green
        }
    } catch {
        Write-Host "  [ERRO] Falha ao gravar em $table : $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Invoke-VpsSQL {
    param([string]$sql)
    $url = "$VPS_URL/rest/v1/rpc/exec_sql"
    # Usar o endpoint de SQL via PostgREST não funciona, precisamos de outra abordagem
    # Vamos usar INSERT direto via REST API
}

# === TABELAS NA ORDEM CORRETA (respeitando FK) ===

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " MIGRAÇÃO: Supabase Cloud → VPS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Locutores
Write-Host "[1/14] Locutores..." -ForegroundColor Yellow
$locutores = Get-CloudData -table "locutores" -select "id,nome,imagem_url,created_at"
if ($locutores.Count -gt 0) { Send-VpsData -table "locutores" -data $locutores }

# 2. Patrocinadores
Write-Host "[2/14] Patrocinadores..." -ForegroundColor Yellow
$patrocinadores = Get-CloudData -table "patrocinadores" -select "id,nome,imagem_url,link,tipo,posicao,created_at"
if ($patrocinadores.Count -gt 0) { Send-VpsData -table "patrocinadores" -data $patrocinadores }

# 3. Publicidade Noticias
Write-Host "[3/14] Publicidade Notícias..." -ForegroundColor Yellow
$publicidade = Get-CloudData -table "publicidade_noticias" -select "id,nome,texto,imagem_url,link,ativo,data_inicio,data_fim,codigo,created_at"
if ($publicidade.Count -gt 0) { Send-VpsData -table "publicidade_noticias" -data $publicidade }

# 4. Promocoes
Write-Host "[4/14] Promoções..." -ForegroundColor Yellow
$promocoes = Get-CloudData -table "promocoes" -select "id,nome,texto,descricao,imagem_url,link,ativo,data_inicio,data_validade,prorrogada_ate,created_at,updated_at"
if ($promocoes.Count -gt 0) { Send-VpsData -table "promocoes" -data $promocoes }

# 5. Noticias (precisa de patrocinadores, publicidade e promocoes já criados)
Write-Host "[5/14] Notícias..." -ForegroundColor Yellow
$noticias = Get-CloudData -table "noticias" -select "id,titulo,resumo,link_completo,imagem_url,conteudo,destaque,patrocinador_id,patrocinador_ativo,publicidade_id,publicidade_ativa,promocao_id,created_at,updated_at"
if ($noticias.Count -gt 0) { Send-VpsData -table "noticias" -data $noticias }

# 6. Programas
Write-Host "[6/14] Programas..." -ForegroundColor Yellow
$programas = Get-CloudData -table "programas" -select "id,nome,locutor_id,horario_inicio,horario_fim,dias_semana,ativo,created_at"
if ($programas.Count -gt 0) { Send-VpsData -table "programas" -data $programas }

# 7. Musicas recentes
Write-Host "[7/14] Músicas Recentes..." -ForegroundColor Yellow
$musicas = Get-CloudData -table "musicas_recentes" -select "id,titulo,artista,hora_execucao,created_at"
if ($musicas.Count -gt 0) { Send-VpsData -table "musicas_recentes" -data $musicas }

# 8. Slide imagens
Write-Host "[8/14] Slides..." -ForegroundColor Yellow
$slides = Get-CloudData -table "slide_imagens" -select "id,imagem_url,ordem,created_at"
if ($slides.Count -gt 0) { Send-VpsData -table "slide_imagens" -data $slides }

# 9. Social links
Write-Host "[9/14] Social Links..." -ForegroundColor Yellow
$social = Get-CloudData -table "social_links" -select "id,nome,url,icone,ordem,ativo,created_at"
if ($social.Count -gt 0) { Send-VpsData -table "social_links" -data $social }

# 10. Paginas
Write-Host "[10/14] Páginas..." -ForegroundColor Yellow
$paginas = Get-CloudData -table "paginas" -select "id,slug,titulo,conteudo,imagem_url,created_at,updated_at"
if ($paginas.Count -gt 0) { Send-VpsData -table "paginas" -data $paginas }

# 11. Radio Config
Write-Host "[11/14] Rádio Config..." -ForegroundColor Yellow
$config = Get-CloudData -table "radio_config" -select "*" -limit 1
if ($config) {
    # Remove o id para gerar um novo no VPS
    $configObj = $config[0] | Select-Object -Property * -ExcludeProperty id
    Send-VpsData -table "radio_config" -data @($configObj)
}

# 12. Profiles
Write-Host "[12/14] Profiles..." -ForegroundColor Yellow
$profiles = Get-CloudData -table "profiles" -select "id,user_id,display_name,email,created_at,updated_at"
if ($profiles.Count -gt 0) { Send-VpsData -table "profiles" -data $profiles }

# 13. User roles
Write-Host "[13/14] User Roles..." -ForegroundColor Yellow
$roles = Get-CloudData -table "user_roles" -select "id,user_id,role"
if ($roles.Count -gt 0) { Send-VpsData -table "user_roles" -data $roles }

# 14. User permissions
Write-Host "[14/14] User Permissions..." -ForegroundColor Yellow
$perms = Get-CloudData -table "user_permissions" -select "id,user_id,permission"
if ($perms.Count -gt 0) { Send-VpsData -table "user_permissions" -data $perms }

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host " MIGRAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Crie um usuário admin no VPS (via Studio > Auth)" -ForegroundColor White
Write-Host "2. Atribua o role 'admin' ao usuário na tabela user_roles" -ForegroundColor White
Write-Host "3. Atualize as variáveis de ambiente do site (.env)" -ForegroundColor White
Write-Host "4. Faça redeploy do site" -ForegroundColor White
