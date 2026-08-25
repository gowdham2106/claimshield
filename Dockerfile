# Multi-stage build - keeps the final image small (only the compiled
# app + runtime, not the full SDK/build tools).

# ---- Build stage ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy just the csproj first so Docker can cache the restore layer
# separately from your actual code - much faster rebuilds.
COPY ClaimShield.Api/*.csproj ./ClaimShield.Api/
RUN dotnet restore ./ClaimShield.Api/ClaimShield.Api.csproj

# Now copy everything else and build.
COPY ClaimShield.Api/ ./ClaimShield.Api/
WORKDIR /src/ClaimShield.Api
RUN dotnet publish -c Release -o /app/publish --no-restore

# ---- Runtime stage ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Tesseract.NET is just a wrapper around the native Tesseract OCR
# engine and its Leptonica image-processing dependency - neither is
# included in the base ASP.NET runtime image, so every OCR call was
# crashing with "Failed to find library libleptonica...so". This
# installs the actual native libraries the wrapper needs at runtime.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        tesseract-ocr \
        libtesseract-dev \
        libleptonica-dev \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

# Render provides the port to listen on via the PORT env var at
# container start (not build time) - so this has to be expanded by a
# shell at runtime, not baked in with a plain ENV/EXPOSE instruction.
ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-8080} dotnet ClaimShield.Api.dll"]