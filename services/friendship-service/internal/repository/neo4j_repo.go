package repository

import (
	"context"
	"friendship-service/internal/domain"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

type neo4jRepository struct {
	driver neo4j.DriverWithContext
}

// NewNeo4jRepository khởi tạo repo với driver Neo4j
func NewNeo4jRepository(driver neo4j.DriverWithContext) domain.FriendshipRepository {
	return &neo4jRepository{driver: driver}
}

// SendRequest: Tạo mối quan hệ REQUESTED từ UserA đến UserB
func (r *neo4jRepository) SendRequest(ctx context.Context, userID, friendID string) error {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	cypher := `
		MERGE (a:User {id: $userID})
		MERGE (b:User {id: $friendID})
		MERGE (a)-[:REQUESTED]->(b)
	`
	_, err := session.Run(ctx, cypher, map[string]any{
		"userID":   userID,
		"friendID": friendID,
	})
	return err
}

// AcceptRequest: Xóa REQUESTED, tạo mối quan hệ FRIEND 2 chiều
func (r *neo4jRepository) AcceptRequest(ctx context.Context, userID, friendID string) error {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	cypher := `
		MATCH (a:User {id: $friendID})-[req:REQUESTED]->(b:User {id: $userID})
		DELETE req
		MERGE (a)-[:FRIEND]->(b)
		MERGE (b)-[:FRIEND]->(a)
	`
	_, err := session.Run(ctx, cypher, map[string]any{
		"userID":   userID,
		"friendID": friendID,
	})
	return err
}

// GetFriends: Lấy danh sách ID những người đã kết bạn
func (r *neo4jRepository) GetFriends(ctx context.Context, userID string) ([]string, error) {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	cypher := `
		MATCH (u:User {id: $userID})-[:FRIEND]->(f:User)
		RETURN f.id as id
	`
	result, err := session.Run(ctx, cypher, map[string]any{"userID": userID})
	if err != nil {
		return nil, err
	}

	var friendIDs []string
	for result.Next(ctx) {
		record := result.Record()
		if id, ok := record.Get("id"); ok {
			friendIDs = append(friendIDs, id.(string))
		}
	}
	return friendIDs, nil
}
