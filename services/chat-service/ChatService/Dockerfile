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

ENTRYPOINT ["dotnet", "ChatService.dll"]