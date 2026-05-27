package repository

import (
	"context"
	"errors"
	"friendship-service/internal/domain"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

type neo4jRepository struct {
	driver neo4j.DriverWithContext
}

func NewNeo4jRepository(driver neo4j.DriverWithContext) domain.FriendshipRepository {
	return &neo4jRepository{driver: driver}
}

func (r *neo4jRepository) EnsureSchema(ctx context.Context) error {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	queries := []string{
		`CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE`,
	}

	for _, query := range queries {
		result, err := session.Run(ctx, query, nil)
		if err != nil {
			return err
		}

		if _, err := result.Consume(ctx); err != nil {
			return err
		}
	}

	return nil
}

func (r *neo4jRepository) SendRequest(ctx context.Context, userID, friendID string) error {
	cypher := `
		MERGE (a:User {id: $userID})
		MERGE (b:User {id: $friendID})
		WITH a, b
		OPTIONAL MATCH (a)-[friend1:FRIEND]->(b)
		OPTIONAL MATCH (b)-[friend2:FRIEND]->(a)
		OPTIONAL MATCH (a)-[block1:BLOCKED]->(b)
		OPTIONAL MATCH (b)-[block2:BLOCKED]->(a)
		OPTIONAL MATCH (a)-[outgoing:REQUESTED]->(b)
		OPTIONAL MATCH (b)-[incoming:REQUESTED]->(a)
		WITH a, b, friend1, friend2, block1, block2, outgoing, incoming
		WHERE friend1 IS NULL
		  AND friend2 IS NULL
		  AND block1 IS NULL
		  AND block2 IS NULL
		  AND outgoing IS NULL
		  AND incoming IS NULL
		MERGE (a)-[:REQUESTED]->(b)
		RETURN true AS ok
	`

	ok, err := r.executeWriteBool(ctx, cypher, map[string]any{
		"userID":   userID,
		"friendID": friendID,
	})
	if err != nil {
		return err
	}

	if !ok {
		return errors.New("không thể gửi lời mời kết bạn")
	}

	return nil
}

func (r *neo4jRepository) AcceptRequest(ctx context.Context, userID, friendID string) error {
	cypher := `
		MATCH (requester:User {id: $friendID})-[req:REQUESTED]->(receiver:User {id: $userID})
		OPTIONAL MATCH (requester)-[block1:BLOCKED]->(receiver)
		OPTIONAL MATCH (receiver)-[block2:BLOCKED]->(requester)
		WITH requester, receiver, req, block1, block2
		WHERE block1 IS NULL AND block2 IS NULL
		DELETE req
		MERGE (requester)-[:FRIEND]->(receiver)
		MERGE (receiver)-[:FRIEND]->(requester)
		RETURN true AS ok
	`

	ok, err := r.executeWriteBool(ctx, cypher, map[string]any{
		"userID":   userID,
		"friendID": friendID,
	})
	if err != nil {
		return err
	}

	if !ok {
		return errors.New("không thể chấp nhận lời mời kết bạn")
	}

	return nil
}

func (r *neo4jRepository) RejectRequest(ctx context.Context, userID, friendID string) error {
	cypher := `
		MATCH (:User {id: $friendID})-[req:REQUESTED]->(:User {id: $userID})
		DELETE req
		RETURN true AS ok
	`

	ok, err := r.executeWriteBool(ctx, cypher, map[string]any{
		"userID":   userID,
		"friendID": friendID,
	})
	if err != nil {
		return err
	}

	if !ok {
		return errors.New("không thể từ chối lời mời kết bạn")
	}

	return nil
}

func (r *neo4jRepository) CancelRequest(ctx context.Context, userID, friendID string) error {
	cypher := `
		MATCH (:User {id: $userID})-[req:REQUESTED]->(:User {id: $friendID})
		DELETE req
		RETURN true AS ok
	`

	ok, err := r.executeWriteBool(ctx, cypher, map[string]any{
		"userID":   userID,
		"friendID": friendID,
	})
	if err != nil {
		return err
	}

	if !ok {
		return errors.New("không thể hủy lời mời kết bạn")
	}

	return nil
}

func (r *neo4jRepository) RemoveFriend(ctx context.Context, userID, friendID string) error {
	cypher := `
		MATCH (a:User {id: $userID})
		MATCH (b:User {id: $friendID})
		OPTIONAL MATCH (a)-[r1:FRIEND]->(b)
		OPTIONAL MATCH (b)-[r2:FRIEND]->(a)
		WITH r1, r2
		WHERE r1 IS NOT NULL OR r2 IS NOT NULL
		DELETE r1, r2
		RETURN true AS ok
	`

	ok, err := r.executeWriteBool(ctx, cypher, map[string]any{
		"userID":   userID,
		"friendID": friendID,
	})
	if err != nil {
		return err
	}

	if !ok {
		return errors.New("không thể xóa bạn bè")
	}

	return nil
}

func (r *neo4jRepository) BlockUser(ctx context.Context, userID, friendID string) error {
	cypher := `
		MERGE (a:User {id: $userID})
		MERGE (b:User {id: $friendID})
		OPTIONAL MATCH (a)-[f1:FRIEND]->(b)
		OPTIONAL MATCH (b)-[f2:FRIEND]->(a)
		OPTIONAL MATCH (a)-[r1:REQUESTED]->(b)
		OPTIONAL MATCH (b)-[r2:REQUESTED]->(a)
		DELETE f1, f2, r1, r2
		WITH a, b
		MERGE (a)-[:BLOCKED]->(b)
		RETURN true AS ok
	`

	ok, err := r.executeWriteBool(ctx, cypher, map[string]any{
		"userID":   userID,
		"friendID": friendID,
	})
	if err != nil {
		return err
	}

	if !ok {
		return errors.New("không thể chặn người dùng")
	}

	return nil
}

func (r *neo4jRepository) UnblockUser(ctx context.Context, userID, friendID string) error {
	cypher := `
		MATCH (:User {id: $userID})-[block:BLOCKED]->(:User {id: $friendID})
		DELETE block
		RETURN true AS ok
	`

	ok, err := r.executeWriteBool(ctx, cypher, map[string]any{
		"userID":   userID,
		"friendID": friendID,
	})
	if err != nil {
		return err
	}

	if !ok {
		return errors.New("không thể bỏ chặn người dùng")
	}

	return nil
}

func (r *neo4jRepository) GetFriends(ctx context.Context, userID string) ([]string, error) {
	cypher := `
		MATCH (:User {id: $userID})-[:FRIEND]->(friend:User)
		RETURN friend.id AS id
		ORDER BY id
	`

	return r.executeReadStringList(ctx, cypher, map[string]any{
		"userID": userID,
	}, "id")
}

func (r *neo4jRepository) GetIncomingRequests(ctx context.Context, userID string) ([]string, error) {
	cypher := `
		MATCH (requester:User)-[:REQUESTED]->(:User {id: $userID})
		RETURN requester.id AS id
		ORDER BY id
	`

	return r.executeReadStringList(ctx, cypher, map[string]any{
		"userID": userID,
	}, "id")
}

func (r *neo4jRepository) GetOutgoingRequests(ctx context.Context, userID string) ([]string, error) {
	cypher := `
		MATCH (:User {id: $userID})-[:REQUESTED]->(receiver:User)
		RETURN receiver.id AS id
		ORDER BY id
	`

	return r.executeReadStringList(ctx, cypher, map[string]any{
		"userID": userID,
	}, "id")
}

func (r *neo4jRepository) GetRelationshipStatus(ctx context.Context, userID, friendID string) (string, error) {
	if userID == friendID {
		return domain.StatusSelf, nil
	}

	cypher := `
		OPTIONAL MATCH (a:User {id: $userID})
		OPTIONAL MATCH (b:User {id: $friendID})
		WITH a, b
		OPTIONAL MATCH (a)-[blockedByMe:BLOCKED]->(b)
		OPTIONAL MATCH (b)-[blockedMe:BLOCKED]->(a)
		OPTIONAL MATCH (a)-[friend:FRIEND]->(b)
		OPTIONAL MATCH (a)-[outgoing:REQUESTED]->(b)
		OPTIONAL MATCH (b)-[incoming:REQUESTED]->(a)
		RETURN CASE
			WHEN a IS NULL OR b IS NULL THEN $none
			WHEN blockedByMe IS NOT NULL THEN $blockedByMe
			WHEN blockedMe IS NOT NULL THEN $blockedMe
			WHEN friend IS NOT NULL THEN $friend
			WHEN outgoing IS NOT NULL THEN $outgoing
			WHEN incoming IS NOT NULL THEN $incoming
			ELSE $none
		END AS status
	`

	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := session.Run(ctx, cypher, map[string]any{
		"userID":      userID,
		"friendID":    friendID,
		"none":        domain.StatusNone,
		"blockedByMe": domain.StatusBlockedByMe,
		"blockedMe":   domain.StatusBlockedMe,
		"friend":      domain.StatusFriend,
		"outgoing":    domain.StatusOutgoingPending,
		"incoming":    domain.StatusIncomingPending,
	})
	if err != nil {
		return "", err
	}

	if result.Next(ctx) {
		value, ok := result.Record().Get("status")
		if !ok {
			return domain.StatusNone, nil
		}

		status, ok := value.(string)
		if !ok {
			return "", errors.New("kiểu dữ liệu status không hợp lệ")
		}

		return status, nil
	}

	if err := result.Err(); err != nil {
		return "", err
	}

	return domain.StatusNone, nil
}

func (r *neo4jRepository) executeWriteBool(ctx context.Context, cypher string, params map[string]any) (bool, error) {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	result, err := session.Run(ctx, cypher, params)
	if err != nil {
		return false, err
	}

	if result.Next(ctx) {
		value, ok := result.Record().Get("ok")
		if !ok {
			return false, nil
		}

		okValue, ok := value.(bool)
		if !ok {
			return false, errors.New("kiểu dữ liệu ok không hợp lệ")
		}

		return okValue, nil
	}

	if err := result.Err(); err != nil {
		return false, err
	}

	return false, nil
}

func (r *neo4jRepository) executeReadStringList(ctx context.Context, cypher string, params map[string]any, fieldName string) ([]string, error) {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := session.Run(ctx, cypher, params)
	if err != nil {
		return nil, err
	}

	items := make([]string, 0)

	for result.Next(ctx) {
		value, ok := result.Record().Get(fieldName)
		if !ok {
			continue
		}

		text, ok := value.(string)
		if !ok {
			continue
		}

		items = append(items, text)
	}

	if err := result.Err(); err != nil {
		return nil, err
	}

	return items, nil
}
