import {ApolloServer} from "@apollo/server"
import {startStandaloneServer} from "@apollo/server/standalone"
import {typeDefs} from "./schema.js"
import {resolvers} from "./resolvers.js"
import dotenv from "dotenv"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import User from "./model/user.js"
dotenv.config()
const server = new ApolloServer({
    typeDefs,
    resolvers,
})

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("connected to MongoDB")
    })
    .catch((error) => {
        console.log("error connection to MongoDB:", error.message)
    })

const {url} = await startStandaloneServer(server, {
    listen: {port: 4000},
    context: async ({req, res}) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.startsWith("Bearer ")) {
            const decodedToken = jwt.verify(
                auth.split(" ")[1],
                process.env.JWT_SECRET
            )

            const currentUser = await User.findById(decodedToken.id).populate(
                "friends"
            )
            return {currentUser}
        }
    },
})

console.log("Server runs at ", url)
