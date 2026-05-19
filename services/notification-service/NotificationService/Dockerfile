FROM mcr.microsoft.com/dotnet/sdk:9.0 AS builder
WORKDIR /src
COPY "NotificationService.csproj" "./"
RUN dotnet restore "NotificationService.csproj"
COPY . .
RUN dotnet publish "NotificationService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runner
WORKDIR /app

ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

COPY --from=builder /app/publish .

ENTRYPOINT ["dotnet", "NotificationService.dll"]