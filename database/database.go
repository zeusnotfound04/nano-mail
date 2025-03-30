package database

import (
	"github.com/rs/zerolog/log"

	"github.com/zeusnotfound04/nano-mail/prisma/db"
)

func ConnectDB() (*db.PrismaClient , error) {
	client := db.NewClient()
	if err := client.Prisma.Connect();  err != nil {
		return nil,  err
	}


	log.Info().Msg("Connect to database!")
	return client , nil
}