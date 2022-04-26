let renderizadorHome = document.querySelector(".caixaQuiz");
let idQuiz;
let objetoQuiz = {};
let perguntasQuiz = {};
let levelsQuiz = {};
let pontos;
let cliques;
let passador;
let levelsOrdenados = [];
let quizSerializado;

function acessarHome () {
    let promise = axios.get('https://mock-api.driven.com.br/api/v6/buzzquizz/quizzes');
    promise.then(renderizarHome)
    document.querySelectorAll(".loading")[0].classList.add("ligado")
    document.querySelectorAll(".loading")[0].classList.remove("desligado")
}
function renderizarHome (resposta) {
    document.querySelectorAll(".loading")[0].classList.add("desligado")
    document.querySelectorAll(".loading")[0].classList.remove("ligado")
    criaConteinerQuizProprios();
    document.querySelector(".home").classList.add("ligado");
    document.querySelector(".home").classList.remove("desligado");
    renderizadorHome.innerHTML = ""
    objetoQuiz = resposta.data
    for (let i = 0; i < resposta.data.length; i ++) {
        renderizadorHome.innerHTML +=`
            <div class="preQuiz a${resposta.data[i].id}" onclick="acessarQuiz(this)">
                <img src="${resposta.data[i].image}" alt="Quizz"/>
                <span>${resposta.data[i].title}</span>
                <div class="gradiente"></div>
            </div>`
    }
}
function randomizar() {
    return Math.random() - 0.5;
}
function acessarQuiz(elemento) {
    cliques = 0;
    pontos = 0;
    document.querySelector(".ligado").classList.add("desligado");
    document.querySelector(".ligado").classList.remove("ligado");
    idQuiz = elemento.classList[1].replace("a","");
    for (let i = 0; i < objetoQuiz.length; i ++) {
        if (idQuiz == objetoQuiz[i].id) {
            perguntasQuiz = objetoQuiz[i].questions;
            levelsQuiz = objetoQuiz[i].levels;
            document.querySelector(".quiz").innerHTML = `
                <div class="topoQuiz">
                    <img src=${objetoQuiz[i].image} alt="img" />
                    <span>${objetoQuiz[i].title}</span>
                    <div class="pelicula"></div>
                </div>`;
            for (let j = 0; j < perguntasQuiz.length; j ++) {
                let complemento = "";
                perguntasQuiz[j].answers.sort(randomizar)
                for (let k = 0; k < perguntasQuiz[j].answers.length; k ++) {
                    complemento += `
                            <div class="element a${perguntasQuiz[j].answers[k].isCorrectAnswer}" onclick="escolherResposta(this)">
                                <img src=${perguntasQuiz[j].answers[k].image} alt="img" />
                                <h6>${perguntasQuiz[j].answers[k].text}</h6>
                                <div class="peliculaBranca desligado"></div>
                            </div>`
                }
                document.querySelector(".quiz").innerHTML += `
                    <div class="perguntaQuiz">
                        <div class="tituloPergunta" style="background-color: ${objetoQuiz[i].questions[j].color};">${objetoQuiz[i].questions[j].title}</div>
                        <div class="grupo a${j}">${complemento}</div>
                    </div>`
            }
            document.querySelector(".quiz").innerHTML +=`
                <button onclick="reiniciarQuiz()">Reiniciar Quizz</button>
                <div class="voltaHome" onclick="sairPagina()">Voltar pra home</div>`
        }
    }
    document.querySelector(".quiz").classList.remove("desligado");
    document.querySelector(".quiz").classList.add("ligado");
    document.querySelector("body").scrollIntoView()
}
function escolherResposta(elemento) {
    passador = elemento.parentNode.classList[1].replace("a","");
    for (let i = 0; i < elemento.parentNode.querySelectorAll(".element").length; i++) {
        if (elemento != elemento.parentNode.querySelectorAll(".element")[i]) {
            elemento.parentNode.querySelectorAll(".element")[i].querySelector(".peliculaBranca").classList.remove("desligado");
            elemento.parentNode.querySelectorAll(".element")[i].removeAttribute("onclick");
        }
        elemento.removeAttribute("onclick");
        if (elemento.parentNode.querySelectorAll(".element")[i].classList[1] !== "atrue") {
            elemento.parentNode.querySelectorAll(".element")[i].querySelector("h6").style.color = "#FF4B4B";
        }else{
            elemento.parentNode.querySelectorAll(".element")[i].querySelector("h6").style.color = "#009C22";
        }
        
    }
    cliques ++;
    if (elemento.classList[1] === "atrue") {
        pontos ++;
    }
    if(cliques == perguntasQuiz.length) {
        for(let i = 0; i < levelsQuiz.length; i ++) {
            levelsOrdenados.push(levelsQuiz[i].minValue)
        }
        for(let i = levelsOrdenados.length - 1; i >= 0; i --) {
            if ((pontos / cliques * 100) >= levelsOrdenados[i]) {
                return criarResultado(levelsOrdenados[i]);
            }
        }
    }
    setTimeout(passarPergunta, 2000)
}

function criarResultado(elemento) {
    console.log(elemento)
    console.log(levelsQuiz)
    for(let i = 0; i < levelsQuiz.length; i ++) {
        if (elemento === levelsQuiz[i].minValue) {
            document.querySelector(".quiz").querySelector("button").remove()
            document.querySelector(".quiz").querySelector(".voltaHome").remove()
            document.querySelector(".quiz").innerHTML += `
                <div class="perguntaQuiz">
                    <div class="tituloPergunta a${perguntasQuiz.length}">${(pontos / cliques * 100).toFixed(2)}% de acerto: ${levelsQuiz[i].title}</div>
                    <div class="nivelFinal">
                        <img src=${levelsQuiz[i].image} alt="img" />
                        <h6>${levelsQuiz[i].text}</h6>
                    </div>
                </div>
                <button onclick="reiniciarQuiz()">Reiniciar Quizz</button>
                <div class="voltaHome" onclick="sairPagina()">Voltar pra home</div>`
        }
    }
    setTimeout(passarPergunta, 2000)
}


function passarPergunta() {
    passador ++;
    passador = ".a" + passador;
    document.querySelector(passador).parentNode.scrollIntoView();
}



function sucessoCriarQuiz(resposta) {
    document.querySelectorAll(".loading")[1].classList.add("desligado")
    document.querySelectorAll(".loading")[1].classList.remove("ligado")
    infoQuizz.id=resposta.data.id
    quizzesUsuario.push(infoQuizz)
    const quizSerializado = JSON.stringify(quizzesUsuario);
    localStorage.setItem("quizzes", quizSerializado);

    document.querySelector(".container-sucesso-quiz").innerHTML =`
        <span>Seu quizz está pronto!</span>
        <div class="preQuiz" onclick="acessarQuizProprio()">
            <img src=${infoQuizz.image} alt="Quizz"/>
            <span>${infoQuizz.title}</span>
            <div class="gradiente"></div>
        </div>
        <button onclick="acessarQuizProprio()">Acessar Quizz</button>
        <div class="voltaHome" onclick="acessarHome()">Voltar pra home</div>`

    document.querySelector(".container-sucesso-quiz").classList.remove("desligado");
    document.querySelector(".container-sucesso-quiz").classList.add("ligado");
}

function acessarQuizProprio() {
    cliques = 0;
    pontos = 0;
    document.querySelector(".ligado").classList.add("desligado");
    document.querySelector(".ligado").classList.remove("ligado");
    document.querySelector(".ligado").classList.add("desligado");
    document.querySelector(".ligado").classList.remove("ligado");
    
    perguntasQuiz = quizzesUsuario[quizzesUsuario.length - 1].questions;
    levelsQuiz = quizzesUsuario[quizzesUsuario.length - 1].levels;
    document.querySelector(".quiz").innerHTML = `
        <div class="topoQuiz">
            <img src=${quizzesUsuario[quizzesUsuario.length - 1].image} alt="img" />
            <span>${quizzesUsuario[quizzesUsuario.length - 1].title}</span>
            <div class="pelicula"></div>
        </div>`;
    for (let j = 0; j < perguntasQuiz.length; j ++) {
        let complemento = "";
        perguntasQuiz[j].answers.sort(randomizar)
        for (let k = 0; k < perguntasQuiz[j].answers.length; k ++) {
            complemento += `
                    <div class="element a${perguntasQuiz[j].answers[k].isCorrectAnswer}" onclick="escolherResposta(this)">
                        <img src=${perguntasQuiz[j].answers[k].image} alt="img" />
                        <h6>${perguntasQuiz[j].answers[k].text}</h6>
                        <div class="peliculaBranca desligado"></div>
                    </div>`
        }
        document.querySelector(".quiz").innerHTML += `
            <div class="perguntaQuiz">
                <div class="tituloPergunta" style="background-color: ${perguntasQuiz[j].color};">${perguntasQuiz[j].title}</div>
                <div class="grupo a${j}">${complemento}</div>
            </div>`
    }
    document.querySelector(".quiz").innerHTML +=`
        <button onclick="reiniciarQuiz()">Reiniciar Quizz</button>
        <div class="voltaHome" onclick="sairPagina()">Voltar pra home</div>`       
    document.querySelector(".quiz").classList.remove("desligado");
    document.querySelector(".quiz").classList.add("ligado");
    document.querySelector("body").scrollIntoView()
}

function sairPagina() {
    document.querySelector(".ligado").classList.add("desligado");
    document.querySelector(".ligado").classList.remove("ligado");
    acessarHome();
}



acessarHome ()