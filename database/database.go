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


func DeleteOldMail() {
	bgClient := db.NewClient()
	err := bgClient.Connect()

	if err != nil {
		log.Logger.Println("[DB][ERROR] : Could not connect to database for cleanup" , err)
		return
	}

	defer bgClient.Disconnect()

	for {
		ctx := context.Background()
		sevenDaysAgo := time.Now().Add(-7 * 24 * time.Hour)

		_, err = bgClient.Mail.FindMany(
			db.Mail.Date.Before(sevenDaysAgo),
		).Delete().Exec(ctx)


		if err != nil {
			log.Logger.Println("Error deleting old emails:", err)
		} else {
			log.Logger.Println("Old emails deleted successfully")
		}

		time.Sleep(24 * time.Hour)
	}
}