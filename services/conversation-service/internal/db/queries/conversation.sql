-- name: CreateConversation :one
INSERT INTO conversations (
    id,
    type,
    name,
    avatar_url,
    owner_id,
    created_by,
    direct_key,
    status,
    created_at,
    updated_at
)
VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, now(), now()
)
RETURNING id, type, name, avatar_url, owner_id, created_by, direct_key, status, created_at, updated_at;

-- name: GetConversationByID :one
SELECT id, type, name, avatar_url, owner_id, created_by, direct_key, status, created_at, updated_at
FROM conversations
WHERE id = $1 AND status = 'ACTIVE';

-- name: GetDirectConversationByKey :one
SELECT id, type, name, avatar_url, owner_id, created_by, direct_key, status, created_at, updated_at
FROM conversations
WHERE direct_key = $1 AND status = 'ACTIVE';

-- name: ListConversationsByUser :many
SELECT c.id, c.type, c.name, c.avatar_url, c.owner_id, c.created_by, c.direct_key, c.status, c.created_at, c.updated_at
FROM conversations c
INNER JOIN conversation_members m ON m.conversation_id = c.id
WHERE m.user_id = $1
  AND m.status = 'ACTIVE'
  AND c.status = 'ACTIVE'
ORDER BY c.updated_at DESC;

-- name: InsertMember :exec
INSERT INTO conversation_members (
    id,
    conversation_id,
    user_id,
    role,
    status,
    joined_at,
    created_at,
    updated_at
)
VALUES (
    $1, $2, $3, $4, 'ACTIVE', now(), now(), now()
);

-- name: UpsertActiveMember :exec
INSERT INTO conversation_members (
    id,
    conversation_id,
    user_id,
    role,
    status,
    joined_at,
    created_at,
    updated_at
)
VALUES (
    $1, $2, $3, $4, 'ACTIVE', now(), now(), now()
)
ON CONFLICT(conversation_id, user_id)
DO UPDATE SET
    role = EXCLUDED.role,
    status = 'ACTIVE',
    joined_at = now(),
    updated_at = now();

-- name: GetMember :one
SELECT id, conversation_id, user_id, role, status, joined_at, created_at, updated_at
FROM conversation_members
WHERE conversation_id = $1
  AND user_id = $2
  AND status = 'ACTIVE';

-- name: ListMembers :many
SELECT id, conversation_id, user_id, role, status, joined_at, created_at, updated_at
FROM conversation_members
WHERE conversation_id = $1
  AND status = 'ACTIVE'
ORDER BY joined_at ASC;

-- name: IsMember :one
SELECT EXISTS (
    SELECT 1
    FROM conversation_members m
    INNER JOIN conversations c ON c.id = m.conversation_id
    WHERE m.conversation_id = $1
      AND m.user_id = $2
      AND m.status = 'ACTIVE'
      AND c.status = 'ACTIVE'
)::boolean;

-- name: GetMemberIDs :many
SELECT user_id
FROM conversation_members
WHERE conversation_id = $1
  AND status = 'ACTIVE'
ORDER BY joined_at ASC;

-- name: RemoveMember :execrows
UPDATE conversation_members
SET status = 'REMOVED',
    updated_at = now()
WHERE conversation_id = $1
  AND user_id = $2
  AND status = 'ACTIVE';

-- name: LeaveConversation :execrows
UPDATE conversation_members
SET status = 'LEFT',
    updated_at = now()
WHERE conversation_id = $1
  AND user_id = $2
  AND status = 'ACTIVE';

-- name: ChangeMemberRole :execrows
UPDATE conversation_members
SET role = $3,
    updated_at = now()
WHERE conversation_id = $1
  AND user_id = $2
  AND status = 'ACTIVE';