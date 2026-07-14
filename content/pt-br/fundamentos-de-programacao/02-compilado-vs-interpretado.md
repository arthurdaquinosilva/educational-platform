---
title: Compilado vs. interpretado
description: Como o texto que você escreve vira algo que o computador executa — e por que Python roda do jeito que roda.
module: primeiros-conceitos
---

# Compilado vs. interpretado

O computador não entende Python. Ele entende **código de máquina**: números que
correspondem a operações elementares do processador. Entre o texto que você
escreve e esses números existe sempre um tradutor. Há duas formas clássicas de
fazer essa tradução.

## Compilado: traduz tudo antes de rodar

Numa linguagem **compilada** (como C ou Go), um programa chamado _compilador_ lê
todo o seu código de uma vez e produz um arquivo executável em código de
máquina. Depois disso, você roda esse executável direto no processador.

- **Vantagem:** costuma ser mais rápido, porque a tradução já foi feita.
- **Custo:** você precisa recompilar a cada mudança antes de ver o resultado.

## Interpretado: traduz enquanto roda

Numa linguagem **interpretada** (como Python), um programa chamado _interpretador_
lê o seu código linha a linha e executa cada instrução na hora, sem gerar um
executável separado.

- **Vantagem:** você muda o código e roda de novo na mesma hora.
- **Custo:** essa tradução em tempo real costuma custar um pouco de velocidade.

:::nota
Na prática a fronteira não é tão nítida — Python, por baixo, compila para um
formato intermediário antes de interpretar. Mas, para começar, a ideia de "traduz
tudo antes" versus "traduz enquanto roda" já te orienta bem.
:::

## Por que isso importa agora

Porque explica a experiência que você vai ter a seguir: com Python, escrever uma
linha e vê-la rodar imediatamente. É esse laço curto — escrever, rodar, ver o
resultado, ajustar — que torna a linguagem tão boa para aprender.

:::solucao[Por que Python para aprender?]
Justamente pelo laço curto e pela sintaxe que sai da frente. Você gasta sua
atenção na lógica do problema, não em cerimônia da linguagem — que é exatamente
o que você quer enquanto os conceitos ainda são novos.
:::
