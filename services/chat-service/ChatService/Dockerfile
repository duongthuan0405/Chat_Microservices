FROM mcr.microsoft.com/dotnet/sdk:9.0 AS builder
WORKDIR /src
COPY "ChatService.csproj" "./"
RUN dotnet restore "ChatService.csproj"
COPY . .
RUN dotnet publish "ChatService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runner
WORKDIR /app

EXPOSE 8080

COPY --from=builder /app/publish .

HEALTHCHECK --interval=60s --timeout=10s --retries=5 --start-period=20s \
    CMD wget --spider http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "ChatService.dll"]