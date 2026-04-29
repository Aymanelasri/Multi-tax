-- SQL Queries for Testing Usage Counter

-- 1. Check current usage counts for all companies
SELECT 
    id,
    nom,
    if,
    usage_count,
    last_used,
    user_id,
    created_at
FROM societes
ORDER BY usage_count DESC, last_used DESC;

-- 2. Check usage history in historiques table
SELECT 
    h.id,
    h.action,
    h.description,
    h.created_at,
    s.nom as societe_nom,
    u.email as user_email
FROM historiques h
LEFT JOIN societes s ON h.societe_id = s.id
LEFT JOIN users u ON h.user_id = u.id
WHERE h.action = 'usage'
ORDER BY h.created_at DESC
LIMIT 20;

-- 3. Find companies never used
SELECT 
    id,
    nom,
    if,
    usage_count,
    last_used,
    created_at
FROM societes
WHERE usage_count = 0 OR usage_count IS NULL
ORDER BY created_at DESC;

-- 4. Find most used companies
SELECT 
    id,
    nom,
    if,
    usage_count,
    last_used,
    user_id
FROM societes
WHERE usage_count > 0
ORDER BY usage_count DESC
LIMIT 10;

-- 5. Check usage by user
SELECT 
    u.id as user_id,
    u.email,
    COUNT(s.id) as total_companies,
    SUM(s.usage_count) as total_usage,
    AVG(s.usage_count) as avg_usage_per_company
FROM users u
LEFT JOIN societes s ON u.id = s.user_id
GROUP BY u.id, u.email
ORDER BY total_usage DESC;

-- 6. Verify data integrity (usage_count should never be negative)
SELECT 
    id,
    nom,
    usage_count
FROM societes
WHERE usage_count < 0;

-- 7. Check recent usage activity (last 24 hours)
SELECT 
    s.id,
    s.nom,
    s.usage_count,
    s.last_used,
    u.email as user_email
FROM societes s
JOIN users u ON s.user_id = u.id
WHERE s.last_used >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY s.last_used DESC;

-- 8. Reset usage count for testing (USE WITH CAUTION)
-- UPDATE societes SET usage_count = 0, last_used = NULL WHERE id = ?;

-- 9. Manually increment usage for testing
-- UPDATE societes SET usage_count = usage_count + 1, last_used = NOW() WHERE id = ?;

-- 10. Check if fields exist in table
DESCRIBE societes;
