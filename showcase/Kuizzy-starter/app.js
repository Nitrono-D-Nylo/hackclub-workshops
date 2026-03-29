const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

const events = require('events')
const timeUpEvent = new events.EventEmitter()

const questions = [{
    text: "What is the smallest prime number?",
    time: 10, // seconds
    options: [
        '0',
        '1',
        '2',
        '3'
    ],
    answer: '2'
},
{
    text: "Find the odd pair out of these:",
    time: 10, // seconds
    options: [
        "2:2",
        '1.5:3',
        '1.2,6',
        '3:9'
    ],
    answer: "3:9"
},
{
    text: "According to Reimann Hypothesis, what is the real part of roots of the Zeta function?",
    time: 10, // seconds
    options: [
        '1',
        '-1',
        '1/2',
        '-1/2'
    ],
    answer: '1/2'
},
]
let userPointsMap = {

}

io.on('connection', (socket) => {
    let attempt = ""
    socket.emit('connected')
    socket.once("name", (name) => {
        userPointsMap[socket.id] = [name, 0]
        io.emit("name", name)
    })
    console.log("A user has connected!")
    socket.once("Start", async () => {
        for (const question of questions) {
            await new Promise(async (resolve) => {
                const toSend = {
                    ...question
                }

                setTimeout(() => {
                    timeUpEvent.emit("timeUp", question.correctAnswer)
                    const sortedValues = Object.values(userPointsMap).sort(([, a], [, b]) => b - a)
                    const top5 = sortedValues.slice(0, 5)

                    io.emit("timeUp", top5)

                    socket.once("next", () => {
                        resolve()
                    })
                }, question.time * 1000)

                delete toSend.correctAnswer
                io.emit('question', toSend)
            })
        }
        const sortedValues = Object.values(userPointsMap).sort(([, a], [, b]) => b - a)
        io.emit("Game Over", sortedValues)
        process.exit(0)
    })
    socket.on("answer",(answer) => {
        attempt = answer
    })

    timeUpEvent.on("timeUp", (correctAnswer) => {
        if(attempt){
            if(attempt == correctAnswer){
                userPointsMap[socket.id][1]++
                socket.emit("correct")
            } else {
                socket.emit("incorrect")
            }
            attempt = ""
        } else {
            socket.emit("not answered")
        }
    })
})

app.use(express.static('public'))
http.lister(3000, () => {
    console.log("Listening on port 3000.")
})