using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChatService.Migrations
{
    /// <inheritdoc />
    public partial class FIX_MessageReadStatus_Only_Have_LatestReadAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MessageReadStatus_Message_LastReadMessageId",
                table: "MessageReadStatus");

            migrationBuilder.DropIndex(
                name: "IX_MessageReadStatus_LastReadMessageId",
                table: "MessageReadStatus");

            migrationBuilder.DropColumn(
                name: "LastReadMessageId",
                table: "MessageReadStatus");

            migrationBuilder.RenameColumn(
                name: "ReadAt",
                table: "MessageReadStatus",
                newName: "LastReadAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "LastReadAt",
                table: "MessageReadStatus",
                newName: "ReadAt");

            migrationBuilder.AddColumn<Guid>(
                name: "LastReadMessageId",
                table: "MessageReadStatus",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_MessageReadStatus_LastReadMessageId",
                table: "MessageReadStatus",
                column: "LastReadMessageId");

            migrationBuilder.AddForeignKey(
                name: "FK_MessageReadStatus_Message_LastReadMessageId",
                table: "MessageReadStatus",
                column: "LastReadMessageId",
                principalTable: "Message",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
