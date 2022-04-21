FROM golang:1.18-alpine

WORKDIR /app

COPY project/* ./
RUN go mod download


RUN go build --tags=jwx_es256k -o /server-did

EXPOSE 8090

CMD /server-did