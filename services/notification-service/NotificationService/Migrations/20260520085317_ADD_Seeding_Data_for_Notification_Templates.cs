using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace NotificationService.Migrations
{
    /// <inheritdoc />
    public partial class ADD_Seeding_Data_for_Notification_Templates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "NotificationTemplates",
                columns: new[] { "Id", "BodyTemplate", "Code", "CreatedAt", "IsActive", "TitleTemplate", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("d3b07384-d113-4a1e-a57d-df9856f61001"), "{SenderName} wants to be friends with you.", "FRIEND_REQUEST_RECEIVED", new DateTime(2026, 5, 20, 0, 0, 0, 0, DateTimeKind.Utc), true, "{SenderName} sent you a friend request", new DateTime(2026, 5, 20, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d3b07384-d113-4a1e-a57d-df9856f61002"), "{SenderName} accepted your friend request. You can now chat!", "FRIEND_REQUEST_ACCEPTED", new DateTime(2026, 5, 20, 0, 0, 0, 0, DateTimeKind.Utc), true, "{SenderName} accepted your friend request", new DateTime(2026, 5, 20, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d3b07384-d113-4a1e-a57d-df9856f61003"), "{AdderName} added you to the group chat {GroupName}.", "ADDED_TO_GROUP_CHAT", new DateTime(2026, 5, 20, 0, 0, 0, 0, DateTimeKind.Utc), true, "Added to group chat {GroupName}", new DateTime(2026, 5, 20, 0, 0, 0, 0, DateTimeKind.Utc) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "NotificationTemplates",
                keyColumn: "Id",
                keyValue: new Guid("d3b07384-d113-4a1e-a57d-df9856f61001"));

            migrationBuilder.DeleteData(
                table: "NotificationTemplates",
                keyColumn: "Id",
                keyValue: new Guid("d3b07384-d113-4a1e-a57d-df9856f61002"));

            migrationBuilder.DeleteData(
                table: "NotificationTemplates",
                keyColumn: "Id",
                keyValue: new Guid("d3b07384-d113-4a1e-a57d-df9856f61003"));
        }
    }
}
