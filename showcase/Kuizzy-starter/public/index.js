const socket = io()
let loader = document.createElement('div')
loader.classList.add("loader")

socket.on('connected', async _ => {
    const name = await swal("Your name:", {
        content: "input",
        button: "Join",
        closeOnClickOutside: false,
        closeOnEsc: false
    })
    socket.emit("name", name)
    swal({
        title: "Waiting for host",
        buttons: false,
        content: loader,
        closeOnClickOutside: false,
        closeOnEsc: false
    })
})

socket.on('question', (question) => {
    swal({
        title: question.text,
        buttons: {
            1: {
                text: question.options[0],
                value: 1,
            },
            2: {
                text: question.options[1],
                value: 2,
            },
            3: {
                text: question.options[2],
                value: 3,
            },
            4: {
                text: question.options[3],
                value: 4,
            }
        },
        closeOnClickOutside: false,
        closeOnEsc: false
    }).then(answer => {
        socket.emit("answer", question.options[answer - 1])
        swal({
            title: "Waiting for all players to finish",
            buttons: false,
            content: loader,
            closeOnClickOutside: false,
            closeOnEsc: false
        })
    })
})

socket.on("correct", async _ => {
    swal({
        title: "Correct Answer!",
        text: "Keep up the grind 😃",
        icon: "success",
        buttons: false,
        closeOnClickOutside: false,
        closeOnEsc: false
    })
})

socket.on("incorrect", async _ => {
    swal({
        title: "Incorrect Answer!",
        text: "Oh my! Better luck next time 👍",
        icon: "error",
        buttons: false,
        closeOnClickOutside: false,
        closeOnEsc: false
    })
})

socket.on("not answered", async _ => {
    swal({
        title: "Time's up!",
        text: "Don't stumble! Onto the next one",
        icon: "error",
        buttons: false,
        closeOnClickOutside: false,
        closeOnEsc: false
    })
})

socket.on("Game Over", async (leaderboard) => {
    let LeaderboardDisplay = document.createElement("ul")
    for (player of leaderboard) {
        LeaderboardDisplay.innerHTML += `<li>${player[0]}: ${player[1]}</li>`
    }
    swal({
        title: "Game Over!",
        icon: info,
        content: LeaderboardDisplay,
        buttons: false,
        closeOnClickOutside: false,
        closeOnEsc: false
    })
})