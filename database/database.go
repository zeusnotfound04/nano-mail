package database

import (
	"context"
	"sync"
	"time"

	"github.com/rs/zerolog/log"

	"github.com/zeusnotfound04/nano-mail/helper"
	"github.com/zeusnotfound04/nano-mail/prisma/db"
)

var(
	client    *db.PrismaClient
	once       sync.Once
)

type SMTPStore struct {
	MailFrom    string
	RcptTo      string
	Data        string
}

func ConnectDB() (*db.PrismaClient , error) {
	client := db.NewClient()
	if err := client.Prisma.Connect();  err != nil {
		return nil,  err
	}


	log.Info().Msg("Connect to database!")
	return client , nil
}


func InitClient() {
	once.Do( func ()  {
		client = db.NewClient()
		err := client.Connect()
		helper.ErrorPanic(err)
	})
}



func AddMail (state SMTPStore) {
	if client == nil {
		InitClient()
	}
	
	ctx := context.Background()


	_, err := client.Mail.CreateOne(
		db.Mail.MailFrom.Set(state.MailFrom),
		db.Mail.RcptTo.Set(state.RcptTo),
		db.Mail.Data.Set(state.Data),
	).Exec(ctx)

	if err !=nil {
		log.Logger.Println("[DB][ERROR] : Could not insert the data:" , err)
	} else {
		log.Logger.Println("[DB][SUCCESS] : Inserted data into db")
	}
}


