# Multi-stage Dockerfile for building and running the auth-service
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# copy csproj and restore as distinct layers
COPY ["auth-service.csproj", "./"]
RUN dotnet restore "./auth-service.csproj"

# copy everything else and publish
COPY . .
RUN dotnet publish "auth-service.csproj" -c Release -o /app/publish /p:PublishTrimmed=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# listen on port 5073 by default
ENV ASPNETCORE_URLS=http://+:5073
EXPOSE 5073

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "auth-service.dll"]
