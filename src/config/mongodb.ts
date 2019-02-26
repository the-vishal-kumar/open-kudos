import { MongoClient, Db, Collection } from 'mongodb';
import { Subject, Observable } from 'rxjs'
import { initWorkspaces } from '../services/db/workspace'

export interface CustomDb extends Db {
    workspaceCollection?: (workspaceName: string, collection: string) => Collection,
    workspaces?: any
}
let db: CustomDb
const connect = new Subject()
const mongoClientOptions = { promiseLibrary: Promise, useNewUrlParser: true }

connectMongo(process.env.DB_URL, mongoClientOptions)

export function connectMongo(dbURL: string, options: {}) {
    MongoClient.connect(dbURL, options, (err, client) => {
        if (err) {
            connect.error(err.stack)
            console.warn(`Failed to connect to the database. ${err.stack}`)
        }
        db = client.db(process.env.DB_NAME)
        db.workspaces = {}
        db.workspaceCollection = (workspaceName: string, collection: string): Collection => {
            return db.collection(`${workspaceName}_${collection}`)
        }
        connect.next(db)
        connect.complete()
        initWorkspaces()
    })
}

export const database = new Observable(subscriber => {
    if (db) {
        subscriber.next(db)
    } else {
        connect.subscribe({
            next: (dbClient) => {
                subscriber.next(dbClient)
                subscriber.complete()
            }
        })
    }
})


export default connect
