
# Template padrão da aplicação

<span style="color:red">Pré-requisitos: <a href="03-Product-design.md"> Especificação do projeto</a></span>, <a href="04-Metodologia.md"> Metodologia</a>, <a href="05-Projeto-interface.md"> Projeto de interface</a>

O **template padrão da aplicação "Reservou"** foi desenvolvido com foco na experiência do usuário (UX), identidade visual consistente e responsividade para diferentes tamanhos de tela (mobile, tablet e desktop). O layout base serve como estrutura para todas as páginas da aplicação, garantindo uniformidade e fácil navegação.

## Identidade Visual

A identidade visual do projeto foi construída com base nos seguintes elementos:

- **Cores predominantes:** azul (representando confiança) e branco (limpeza e clareza).
- **Tipografia:** fontes sans-serif de fácil leitura, aplicadas em títulos, botões e textos de apoio.
- **Logotipo:** ícone do projeto "Reservou", que representa a reserva de forma moderna e digital.
- **Espaçamento e alinhamento:** margens e paddings bem definidos para garantir equilíbrio visual.

## Responsividade

A aplicação utiliza o **framework Bootstrap**, garantindo um layout **responsivo** e adaptável:

- Utilização de `container`, `row` e `col` para estrutura de grids.
- Media queries automáticas para redimensionamento de colunas.
- Menu de navegação adaptável (hambúrguer) em telas menores.
- Cards de restaurantes, reservas e cardápios com design fluido.

O template foi testado e adaptado para os principais tamanhos de dispositivos:

- Smartphones (até 768px)
- Tablets (768px a 1024px)
- Desktops (1024px ou mais)

## Estrutura base do layout

Todas as páginas seguem a estrutura padrão abaixo:

```html
<header>
  <!-- Logo e navegação -->
</header>

<main>
  <!-- Conteúdo principal da página -->
</main>

<footer>
  <!-- Informações de contato, direitos autorais e links úteis -->
</footer>
````

Essa estrutura foi implementada com HTML5 semântico e enriquecida com componentes do Bootstrap, como carrossel, cards e botões estilizados.

## Iconografia

A aplicação utiliza ícones que auxiliam na **navegação intuitiva**, como:

* Ícone de menu hambúrguer
* Corações para favoritos
* Calendário para datas de reserva
* Lixeira para exclusão
* Lápis para edição



