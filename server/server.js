import "dotenv/config"
import express from "express"
import dbconnect from "./config/db.connect.js"
import errorHandler from "./middlewares/errorHandler.js"
import authRouter from './router/auth.router.js'
import cookieParser from 'cookie-parser'
import googleAuthRouter from "./router/google.auth.router.js"
import passport from "passport"
import cors from "cors"
import './config/passport.config.js'

const server = express()
server.set('trust proxy', 1)
server.use(express.json())
server.use(cookieParser())
server.use(passport.initialize())

server.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}))

server.use("/api/auth/google", googleAuthRouter)
server.use("/api/auth", authRouter)

server.use(errorHandler)

export default server

const startServer = async () => {
    try{
        const connection = await dbconnect.getConnection()
        connection.release()
        console.log("database connect")

        const PORT = process.env.PORT

        server.listen(PORT, () => {
            console.log(`server is running on ${PORT} port`)
        })

    }catch(error){
        console.error("database not connection", error.message)
        process.exit(1)
    }
}
if (!process.env.VERCEL) {
    startServer()
}