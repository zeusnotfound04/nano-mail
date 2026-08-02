# Go SMTP server
FROM golang:1.24-alpine AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY cmd ./cmd
COPY database ./database
COPY helper ./helper
COPY internal ./internal
COPY pkg ./pkg

RUN CGO_ENABLED=0 GOOS=linux go build -o nanomail-smtp ./cmd/server

FROM alpine:3.19
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /app/nanomail-smtp .

EXPOSE 25
ENTRYPOINT ["./nanomail-smtp"]
