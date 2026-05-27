-- +goose Up
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    owner_id UUID,
    created_by UUID NOT NULL,
    direct_key VARCHAR(100),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_conversations_direct_key
ON conversations(direct_key)
WHERE direct_key IS NOT NULL AND status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_conversations_status
ON conversations(status);

CREATE TABLE IF NOT EXISTS conversation_members (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_members_conversation_status
ON conversation_members(conversation_id, status);

CREATE INDEX IF NOT EXISTS idx_conversation_members_user_status
ON conversation_members(user_id, status);

CREATE TABLE IF NOT EXISTS conversation_invites (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL,
    invitee_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_conversation_invites_invitee_status
ON conversation_invites(invitee_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS ux_conversation_pending_invite
ON conversation_invites(conversation_id, invitee_id)
WHERE status = 'PENDING';

-- +goose Down
DROP INDEX IF EXISTS ux_conversation_pending_invite;
DROP INDEX IF EXISTS idx_conversation_invites_invitee_status;
DROP TABLE IF EXISTS conversation_invites;

DROP INDEX IF EXISTS idx_conversation_members_user_status;
DROP INDEX IF EXISTS idx_conversation_members_conversation_status;
DROP TABLE IF EXISTS conversation_members;

DROP INDEX IF EXISTS idx_conversations_status;
DROP INDEX IF EXISTS ux_conversations_direct_key;
DROP TABLE IF EXISTS conversations;