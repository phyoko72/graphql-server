import {ApolloServer} from "@apollo/server"
import {startStandaloneServer} from "@apollo/server/standalone"
import {expressMiddleware} from "@apollo/server/express4"
import {ApolloServerPluginDrainHttpServer} from "@apollo/server/plugin/drainHttpServer"
import {makeExecutableSchema} from "@graphql-tools/schema"
import express from "express"
import cors from "cors"
import http from "http"
import {WebSocketServer} from "ws"
import {useServer} from "graphql-ws/lib/use/ws"
import {typeDefs} from "./schema.js"
import {resolvers} from "./resolvers.js"
import dotenv from "dotenv"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import User from "./model/user.js"
dotenv.config()

// const server = new ApolloServer({
//     typeDefs,
//     resolvers,
// })

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("connected to MongoDB")
    })
    .catch((error) => {
        console.log("error connection to MongoDB:", error.message)
    })

const start = async () => {
    const app = express()
    const httpServer = http.createServer(app)

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: "/",
    })
    const schema = makeExecutableSchema({typeDefs, resolvers})
    const serverCleanup = useServer({schema}, wsServer)

    const server = new ApolloServer({
        schema,
        plugins: [
            ApolloServerPluginDrainHttpServer({httpServer}),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose()
                        },
                    }
                },
            },
        ],
    })

    await server.start()

    app.use(
        "/",
        cors(),
        express.json(),
        expressMiddleware(server, {
            context: async ({req}) => {
                const auth = req ? req.headers.authorization : null
                if (auth && auth.startsWith("Bearer ")) {
                    const decodedToken = jwt.verify(
                        auth.substring(7),
                        process.env.JWT_SECRET
                    )
                    const currentUser = await User.findById(
                        decodedToken.id
                    ).populate("friends")
                    return {currentUser}
                }
            },
        })
    )

    const PORT = 4000

    httpServer.listen(PORT, () =>
        console.log(`Server is now running on http://localhost:${PORT}`)
    )
}

start()

// const {url} = await startStandaloneServer(server, {
//     listen: {port: 4000},
//     context: async ({req, res}) => {
//         const auth = req ? req.headers.authorization : null
//         if (auth && auth.startsWith("Bearer ")) {
//             const decodedToken = jwt.verify(
//                 auth.split(" ")[1],
//                 process.env.JWT_SECRET
//             )

//             const currentUser = await User.findById(decodedToken.id).populate(
//                 "friends"
//             )
//             return {currentUser}
//         }
//     },
// })

// console.log("Server runs at ", url)
