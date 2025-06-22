# Plano de Testes de Software

<span style="color:red">Pré-requisitos: <a href="03-Product-design.md">Especificação do projeto</a></span>, <a href="05-Projeto-interface.md">Projeto de interface</a>

O plano de testes de software é gerado a partir da especificação do sistema e consiste em casos de teste que deverão ser executados quando a implementação estiver parcial ou totalmente pronta. Apresente os cenários de teste utilizados na realização dos testes da sua aplicação. Escolha cenários de teste que demonstrem os requisitos sendo satisfeitos.

Os testes de software para a aplicação **"Reservou"** foram elaborados para validar a conformidade com os requisitos funcionais e não funcionais definidos no projeto. A metodologia incluiu testes funcionais, de usabilidade e de responsividade, realizados de forma manual pela equipe. Os cenários de teste abaixo detalham os passos para verificação das principais funcionalidades do sistema.

---

## Caso de teste CT-001 – Cadastro e Login de Usuários

- **Requisito associado:** RF-01: O sistema deve permitir o login para administrador (restaurante) e usuário (cliente).  
- **Objetivo do teste:** Verificar se o sistema permite o cadastro correto de usuários e sua autenticação.  
- **Passos:**  
  - Acessar a aplicação.  
  - Clicar na opção de cadastro de novo usuário.  
  - Preencher o formulário com dados válidos (nome, e-mail, senha).  
  - Submeter o formulário de cadastro.  
  - Tentar realizar um novo cadastro utilizando um e-mail já existente.  
  - Acessar a página de login.  
  - Tentar realizar o login com credenciais incorretas.  
  - Realizar o login com as credenciais corretas.  
- **Critério de êxito:**  
  - O cadastro é realizado com sucesso com dados válidos.  
  - O sistema impede o cadastro de um e-mail duplicado.  
  - O login é bem-sucedido apenas com credenciais corretas.  
  - O teste foi aprovado.  
- **Responsável:** Caio Antônio

---

## Caso de teste CT-002 – Realizar Reserva

- **Requisito associado:** RF-04: O cliente deve poder realizar reservas por meio de um calendário interativo.  
- **Objetivo do teste:** Validar o fluxo completo de criação, visualização e cancelamento de reservas pelo cliente.  
- **Passos:**  
  - Acessar a aplicação e efetuar login como cliente.  
  - Na lista de restaurantes, selecionar um estabelecimento.  
  - Utilizar o calendário interativo para selecionar uma data e horário disponíveis.  
  - Tentar selecionar uma data e horário indisponíveis.  
  - Preencher os dados da reserva (ex: número de pessoas).  
  - Confirmar a reserva.  
  - Acessar o dashboard do cliente para visualizar o histórico de reservas.  
  - Localizar a reserva criada e solicitar o cancelamento.  
- **Critério de êxito:**  
  - A reserva é efetuada com sucesso para horários disponíveis e o sistema nega a reserva para horários indisponíveis.  
  - A reserva consta no dashboard do cliente.  
  - O cancelamento da reserva é realizado com sucesso.  
  - O teste foi aprovado.  
- **Responsável:** Juan Carlos

---

## Caso de teste CT-003 – Gerenciar Reservas (Admin)

- **Requisito associado:** RF-08: O administrador deve poder gerenciar (visualizar, alterar, cancelar) as reservas.  
- **Objetivo do teste:** Verificar as funcionalidades de gerenciamento de reservas no painel do administrador.  
- **Passos:**  
  - Acessar a aplicação e efetuar login como administrador.  
  - Acessar o painel administrativo.  
  - Visualizar a lista de todas as reservas em tempo real.  
  - Selecionar uma reserva para visualizar seus detalhes.  
  - Alterar o status de uma reserva (ex: de "pendente" para "confirmada").  
  - Cancelar uma reserva existente.  
- **Critério de êxito:**  
  - O administrador consegue visualizar, alterar o status e cancelar as reservas, e as alterações são refletidas no sistema.  
  - O teste foi aprovado.  
- **Responsável:** Paulo Henrique

---

## Caso de teste CT-004 – Gerenciar Perfil e Cardápio (Admin)

- **Requisito associado:** RF-10: O administrador deve poder atualizar o cardápio e outras informações do seu perfil.  
- **Objetivo do teste:** Verificar se o administrador do restaurante consegue editar as informações do seu perfil e gerenciar os itens do cardápio.  
- **Passos:**  
  - Acessar a aplicação e efetuar login como administrador.  
  - No painel administrativo, navegar para a área de edição do perfil do restaurante.  
  - Alterar informações como nome, endereço e telefone.  
  - Salvar as alterações.  
  - Navegar até a seção de gerenciamento de cardápio.  
  - Adicionar um novo item (prato ou bebida) com descrição e preço.  
  - Editar um item existente no cardápio.  
  - Remover um item do cardápio.  
- **Critério de êxito:**  
  - As informações do perfil do restaurante e do cardápio são atualizadas com sucesso (operações CRUD).  
  - O teste foi aprovado.  
- **Responsável:** Sofia Sousa

---

## Caso de teste CT-005 – Cadastrar e Gerenciar Mesas (Admin)

- **Requisito associado:** RF-09: O administrador deve poder cadastrar, editar e remover as mesas do seu estabelecimento.  
- **Objetivo do teste:** Verificar se o administrador consegue cadastrar seu restaurante na plataforma e gerenciar a disposição das mesas.  
- **Passos:**  
  - Realizar o login como administrador.  
  - Acessar o painel administrativo.  
  - Navegar até a seção de gerenciamento de mesas.  
  - Clicar na opção para "Cadastrar" uma nova mesa.  
  - Preencher os dados da mesa (ex: capacidade).  
  - Salvar a nova mesa.  
  - Selecionar uma mesa existente e "Editar" sua capacidade.  
  - Salvar a alteração.  
  - Selecionar uma mesa e "Remover".  
- **Critério de êxito:**  
  - O administrador consegue realizar as operações de cadastrar, editar e remover mesas com sucesso, e as alterações são refletidas no sistema de reservas.  
- **Responsável:** Arthur Augusto

---

## Caso de teste CT-006 – Adicionar Restaurante aos Favoritos

- **Requisito associado:** Funcionalidade do Sistema de Favoritos, conforme descrito nas funcionalidades desenvolvidas.  
- **Objetivo do teste:** Verificar se o cliente consegue adicionar e remover restaurantes de sua lista de favoritos.  
- **Passos:**  
  - Acessar a aplicação e efetuar login como cliente.  
  - Navegar pela lista de restaurantes disponíveis.  
  - Escolher um restaurante e clicar na opção para "Marcar como favorito".  
  - Acessar o dashboard do cliente.  
  - Verificar se o restaurante selecionado aparece na "Lista personalizada de estabelecimentos preferidos do usuário".  
  - Remover o restaurante da lista de favoritos.  
- **Critério de êxito:**  
  - O restaurante é adicionado e removido da lista de favoritos do usuário com sucesso.  
  - A lista de favoritos no dashboard é atualizada corretamente após cada ação.  
- **Responsável:** Gean Marques
