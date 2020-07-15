const sprites = new Image();
sprites.src = "./sprites.png";

let frames = 0;
const hit = new Audio();
hit.src = "./efeitos/hit.wav";

const canvas = document.getElementById("game-canvas");
const contexto = canvas.getContext("2d");

const planoDeFundo = {
  spriteX: 390,
  spriteY: 0,
  largura: 275,
  altura: 204,
  x: 0,
  y: canvas.height - 204,
  desenha() {
    contexto.fillStyle = "#70c5ce";
    contexto.fillRect(0, 0, canvas.width, canvas.height);

    contexto.drawImage(
      sprites,
      planoDeFundo.spriteX,
      planoDeFundo.spriteY,
      planoDeFundo.largura,
      planoDeFundo.altura,
      planoDeFundo.x,
      planoDeFundo.y,
      planoDeFundo.largura,
      planoDeFundo.altura
    );

    contexto.drawImage(
      sprites,
      planoDeFundo.spriteX,
      planoDeFundo.spriteY,
      planoDeFundo.largura,
      planoDeFundo.altura,
      planoDeFundo.x + planoDeFundo.largura,
      planoDeFundo.y,
      planoDeFundo.largura,
      planoDeFundo.altura
    );
  },
};

function criaChao() {
  const chao = {
    spriteX: 0,
    spriteY: 610,
    largura: 224,
    altura: 112,
    x: 0,
    y: canvas.height - 112,
    atualiza() {
      const movimentoChao = 1;
      const repeteEm = chao.largura / 2;
      const movimentacao = chao.x - movimentoChao;

      chao.x = movimentacao % repeteEm;
    },
    desenha() {
      contexto.drawImage(
        sprites,
        chao.spriteX,
        chao.spriteY,
        chao.largura,
        chao.altura,
        chao.x,
        chao.y,
        chao.largura,
        chao.altura
      );

      contexto.drawImage(
        sprites,
        chao.spriteX,
        chao.spriteY,
        chao.largura,
        chao.altura,
        chao.x + chao.largura,
        chao.y,
        chao.largura,
        chao.altura
      );
    },
  };
  return chao;
}

function fazColisao(flappyBird, chao) {
  const flappyBirdY = flappyBird.y + flappyBird.altura;

  return flappyBirdY >= chao.y;
}

function criaFlappyBird() {
  const flappyBird = {
    spriteX: 0,
    spriteY: 0,
    largura: 33,
    altura: 24,
    x: 10,
    y: 50,
    gravidade: 0.25,
    velocidade: 0,
    pulo: 4.6,
    pular() {
      flappyBird.velocidade = -flappyBird.pulo;
    },
    atualiza() {
      if (fazColisao(flappyBird, globais.chao)) {
        hit.play();
        setTimeout(() => {
          mudaTela(Telas.INICIO);
        }, 500);
        return;
      }

      flappyBird.velocidade = flappyBird.velocidade + flappyBird.gravidade;
      flappyBird.y = flappyBird.y + flappyBird.velocidade;
    },
    movimentos: [
      {
        spriteX: 0,
        spriteY: 0,
      },
      {
        spriteX: 0,
        spriteY: 26,
      },
      {
        spriteX: 0,
        spriteY: 52,
      },
      {
        spriteX: 0,
        spriteY: 26,
      },
    ],
    frameAtual: 0,
    atualizaFrameAtual() {
      const intervaloDeFrames = 10;
      const passouIntervalo = frames % intervaloDeFrames === 0;

      if (passouIntervalo) {
        const incremento = this.frameAtual + 1;
        this.frameAtual = incremento % this.movimentos.length;
      }
    },
    desenha() {
      const { spriteX, spriteY } = this.movimentos[this.frameAtual];

      this.atualizaFrameAtual();
      contexto.drawImage(
        sprites,
        spriteX,
        spriteY, // Sprite X, Sprite Y
        flappyBird.largura,
        flappyBird.altura, // Tamanho do recorte na sprite
        flappyBird.x,
        flappyBird.y,
        flappyBird.largura,
        flappyBird.altura
      );
    },
  };
  return flappyBird;
}

function criaCanos() {
  const canos = {
    largura: 52,
    altura: 400,
    chao: {
      spriteX: 0,
      spriteY: 169,
    },
    ceu: {
      spriteX: 52,
      spriteY: 169,
    },
    espaco: 150,
    desenha() {
      this.pares.forEach((par) => {
        const yRandom = par.y;

        //Cano ceu
        const canoCeuX = par.x;
        const canoCeuY = yRandom;

        contexto.drawImage(
          sprites,
          this.ceu.spriteX,
          this.ceu.spriteY,
          this.largura,
          this.altura,
          canoCeuX,
          canoCeuY,
          this.largura,
          this.altura
        );

        //Cano chão
        const canoChaoX = par.x;
        const canoChaoY = this.altura + this.espaco + yRandom;

        contexto.drawImage(
          sprites,
          this.chao.spriteX,
          this.chao.spriteY,
          this.largura,
          this.altura,
          canoChaoX,
          canoChaoY,
          this.largura,
          this.altura
        );

        par.canoCeu = {
          x: canoCeuX,
          y: this.altura + canoCeuY,
        };

        par.canoChao = {
          x: canoChaoX,
          y: canoChaoY,
        };
      });
    },
    pares: [],
    temColisaoFlappyBird(par) {
      const cabecaFlappyBird = globais.flappyBird.y;
      const peFlappyBird = globais.flappyBird.y + globais.flappyBird.altura;

      if (globais.flappyBird.x >= par.x) {
        return (
          cabecaFlappyBird <= par.canoCeu.y || peFlappyBird >= par.canoChao.y
        );
      }
      return false;
    },
    atualiza() {
      const passou100Frames = frames % 100 === 0;
      if (passou100Frames) {
        this.pares.push({
          x: canvas.width,
          y: -150 * (Math.random() + 1),
        });
      }

      this.pares.forEach((par) => {
        par.x -= 2;

        if (canos.temColisaoFlappyBird(par)) {
          const cabecaFlappyBird = globais.flappyBird.y;
          const peFlappyBird = globais.flappyBird.y + globais.flappyBird.altura;
          hit.play();
          setTimeout(() => {
            mudaTela(Telas.INICIO);
            console.log("colisao", cabecaFlappyBird, peFlappyBird);
            console.log(par.canoCeu.y, par.canoChao.y);
          }, 500);
          return;
        }

        if (par.x + canos.largura <= 0) {
          this.pares.shift();
        }
      });
    },
  };
  return canos;
}

const mensagemGetReady = {
  sX: 134,
  sY: 0,
  w: 174,
  h: 152,
  x: canvas.width / 2 - 174 / 2,
  y: 50,
  desenha() {
    contexto.drawImage(
      sprites,
      mensagemGetReady.sX,
      mensagemGetReady.sY,
      mensagemGetReady.w,
      mensagemGetReady.h,
      mensagemGetReady.x,
      mensagemGetReady.y,
      mensagemGetReady.w,
      mensagemGetReady.h
    );
  },
};

//
// Telas
const globais = {};
let telaAtiva = {};
function mudaTela(novaTela) {
  telaAtiva = novaTela;

  if (telaAtiva.inicializa) {
    telaAtiva.inicializa();
  }
}

const Telas = {
  INICIO: {
    inicializa() {
      globais.flappyBird = criaFlappyBird();
      globais.chao = criaChao();
      globais.canos = criaCanos();
    },
    desenha() {
      planoDeFundo.desenha();
      globais.chao.desenha();
      globais.flappyBird.desenha();
      mensagemGetReady.desenha();
    },
    atualiza() {
      globais.chao.atualiza();
    },
    handleClick() {
      mudaTela(Telas.JOGO);
    },
  },
  JOGO: {
    desenha() {
      planoDeFundo.desenha();
      globais.canos.desenha();
      globais.chao.desenha();
      globais.flappyBird.desenha();
    },
    atualiza() {
      globais.flappyBird.atualiza();
      globais.canos.atualiza();
      globais.chao.atualiza();
    },
    handleClick() {
      globais.flappyBird.pular();
    },
  },
};

function loop() {
  telaAtiva.desenha();
  telaAtiva.atualiza();
  requestAnimationFrame(loop);
  frames = frames + 1;
}

window.addEventListener("click", function () {
  if (telaAtiva.handleClick) {
    telaAtiva.handleClick();
  }
});

mudaTela(Telas.INICIO);
loop();
