// Start Training
function startProject() {
    alert("Welcome to FIGHTLAB!");
}


// Technique Library
function showTechnique(technique) {

    let details = "";

    if (technique === "Jab") {

        details = `
            <h3>🥊 Jab</h3>
            <p>A straight punch thrown with the lead hand.</p>
            <p><b>Use:</b> Distance control and setting up combinations.</p>
        `;

    } else if (technique === "Cross") {

        details = `
            <h3>🥊 Cross</h3>
            <p>A straight punch thrown with the rear hand.</p>
            <p><b>Use:</b> Power striking and combinations.</p>
        `;

    } else if (technique === "Round Kick") {

        details = `
            <h3>🦵 Round Kick</h3>
            <p>A rotational kick commonly used in MMA and kickboxing.</p>
            <p><b>Use:</b> Attacking the legs, body or head.</p>
        `;

    } else if (technique === "Takedown") {

        details = `
            <h3>🤼 Takedown</h3>
            <p>A technique used to take an opponent to the ground.</p>
            <p><b>Use:</b> Ground control and positioning.</p>
        `;
    }

    document.getElementById("result").innerHTML = details;
}


// Fight Analysis
const analysisForm = document.getElementById("analysisForm");

if (analysisForm) {

    analysisForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const fighter =
            document.getElementById("fighter").value;

        const technique =
            document.getElementById("technique").value;

        const observation =
            document.getElementById("observation").value;

        fetch("/analysis", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                fighter: fighter,
                technique: technique,
                observation: observation
            })

        })
        .then(response => response.text())
        .then(data => {

            document.getElementById("analysisMessage").innerHTML =
                "<p style='color:red;'>Analysis saved successfully.</p>";

            analysisForm.reset();

        })
        .catch(() => {

            document.getElementById("analysisMessage").innerHTML =
                "<p>Something went wrong.</p>";

        });

    });

}


// Fight IQ Quiz
const quizForm = document.getElementById("quizForm");

if (quizForm) {

    quizForm.addEventListener("submit", function(event) {

        event.preventDefault();

        let score = 0;

        const answers =
            document.querySelectorAll(
                "#quizForm input[type='radio']:checked"
            );

        answers.forEach(function(answer) {

            if (answer.value === "correct") {
                score++;
            }

        });

        document.getElementById("quizResult").innerHTML =
            "Your Score: " + score + " / 5";

    });

}


// Training Assistant
function askAI() {

    const question =
        document.getElementById("aiQuestion").value;

    const answer =
        document.getElementById("aiAnswer");

    if (question.trim() === "") {

        answer.innerHTML =
            "Please enter a question.";

        return;
    }

    answer.innerHTML =
        "Thinking...";

    fetch("/ai", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            question: question
        })

    })
    .then(response => response.json())
    .then(data => {

        answer.innerHTML =
            data.answer;

    })
    .catch(() => {

        answer.innerHTML =
            "Training Assistant is currently unavailable.";

    });

}